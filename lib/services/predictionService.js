/**
 * LSTM Prediction Service
 * Handles GPS sequence prediction for trajectory estimation
 * 
 * Phase 1: Stubs and function signatures
 * Phase 2: Full implementation with TensorFlow.js
 */

import tf from '@tensorflow/tfjs';
import { loadModel } from './modelService';
import { normalizeSequence, denormalizeValue } from '../utils/scaler';
import { displacementToCoordinates } from '../utils/calculations';
import { HYBRID_CONFIG, MODEL_CONFIG, DEBUG_CONFIG } from '../utils/constants';
import diagnosticsService from './diagnosticsService';

/**
 * Predict the next GPS location based on a sequence of recent points
 * Uses LSTM model trained on Nigerian GPS trajectories
 * @param {Array} gpsPoints - Array of GPS points (minimum 10 required)
 * @returns {Promise<{dx: number, dy: number, confidence: number} | null>}
 */
export async function predictNextLocation(gpsPoints) {
  try {
    // Validate input
    if (!gpsPoints || gpsPoints.length < MODEL_CONFIG.SEQUENCE_LENGTH) {
      if (DEBUG_CONFIG.LOG_AI_PREDICTIONS) {
        console.warn(`[PredictionService] Need at least ${MODEL_CONFIG.SEQUENCE_LENGTH} points for prediction, got ${gpsPoints?.length || 0}`);
      }
      return null;
    }

    // Take only GPS-sourced points (prevent AI→AI feedback loops)
    const gpsOnlyPoints = gpsPoints.filter(p => p.source === 'gps' || !p.source).slice(-MODEL_CONFIG.SEQUENCE_LENGTH);

    if (gpsOnlyPoints.length < MODEL_CONFIG.SEQUENCE_LENGTH) {
      if (DEBUG_CONFIG.LOG_AI_PREDICTIONS) {
        console.warn(`[PredictionService] Not enough GPS points (non-AI): ${gpsOnlyPoints.length}`);
      }
      return null;
    }

    // Update buffered GPS points count
    diagnosticsService.updateBufferedGpsPoints(gpsOnlyPoints.length);

    // Load model
    const model = await loadModel();
    if (!model) {
      console.error('[PredictionService] Model failed to load');
      diagnosticsService.recordInferenceError();
      return null;
    }

    // Normalize the sequence
    const normalizedSeq = normalizeSequence(gpsOnlyPoints);

    // Start inference timing
    diagnosticsService.startInference();

    // Run prediction
    const prediction = await runPrediction(model, normalizedSeq, gpsOnlyPoints);

    // Calculate inference time
    const inferenceStartTime = diagnosticsService.getInferenceStartTime();
    const inferenceTime = inferenceStartTime ? Date.now() - inferenceStartTime : 0;

    if (!prediction) {
      diagnosticsService.recordInferenceError();
      return null;
    }

    const { dx, dy } = prediction;

    // Calculate confidence (inverse of displacement magnitude)
    const displacement = Math.sqrt(dx * dx + dy * dy);
    const confidence = Math.max(0, Math.min(1, 1 - (displacement / 50)));

    const result = {
      dx: parseFloat(dx.toFixed(2)),
      dy: parseFloat(dy.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(3)),
    };

    // Calculate predicted coordinates for diagnostics
    const lastPoint = gpsOnlyPoints[gpsOnlyPoints.length - 1];
    const nextPos = displacementToCoordinates(lastPoint.lat, lastPoint.lon, dx, dy);

    // Record inference
    diagnosticsService.recordInference(nextPos.lat, nextPos.lon, inferenceTime);

    if (DEBUG_CONFIG.LOG_AI_PREDICTIONS) {
      console.log('[PredictionService] Prediction:', result);
    }

    return result;
  } catch (error) {
    console.error('[PredictionService] Prediction error:', error);
    diagnosticsService.recordInferenceError();
    return null;
  }
}

/**
 * Run actual LSTM inference (Phase 2 implementation)
 * @param {tf.LayersModel} model - TensorFlow model
 * @param {number[][]} normalizedSeq - Normalized input sequence
 * @returns {Promise<{dx: number, dy: number}>}
 * @private
 */
async function runPrediction(model, normalizedSeq, gpsOnlyPoints) {
  let inputTensor = null;
  let outputTensor = null;

  try {
    // Create input tensor [1, SEQUENCE_LENGTH, NUM_FEATURES]
    inputTensor = tf.tensor3d([normalizedSeq], [1, MODEL_CONFIG.SEQUENCE_LENGTH, MODEL_CONFIG.NUM_FEATURES]);

    // Run inference
    outputTensor = model.predict(inputTensor);

    // Get output data
    const predArray = await outputTensor.data();

    // Model outputs [batch, 2] -> [dx_normalized, dy_normalized]
    const dx_normalized = predArray[0];
    const dy_normalized = predArray[1];

    // Treat model outputs as displacements (meters). Do NOT denormalize
    // unless your training produced normalized displacement outputs matching the scaler.
    // The web predictor returns raw dx/dy directly, so we follow that behavior.
    const dx = dx_normalized;
    const dy = dy_normalized;

    if (DEBUG_CONFIG.LOG_AI_PREDICTIONS) {
      console.log('[PredictionService] Raw TF output:', { dx_normalized, dy_normalized });
      console.log('[PredictionService] Denormalized:', { dx, dy });
    }

    return { dx, dy };
  } catch (error) {
    console.error('[PredictionService] TensorFlow inference error:', error);
    return { dx: 0, dy: 0 };
  } finally {
    // Clean up tensors (critical for mobile memory management)
    if (inputTensor) {
      inputTensor.dispose();
    }
    if (outputTensor) {
      outputTensor.dispose();
    }
  }
}

/**
 * Batch predict multiple sequences (for testing/evaluation)
 * @param {Array[]} sequences - Array of GPS point sequences
 * @returns {Promise<Array>} Array of prediction results
 */
export async function batchPredict(sequences) {
  const results = [];

  for (const seq of sequences) {
    const result = await predictNextLocation(seq);
    if (result) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Get prediction confidence statistics
 * @param {Array} predictions - Array of prediction results
 * @returns {Object} Statistics (mean, min, max confidence)
 */
export function getPredictionStats(predictions) {
  if (!predictions || predictions.length === 0) {
    return { mean: 0, min: 0, max: 0 };
  }

  const confidences = predictions.map(p => p.confidence || 0);
  const mean = confidences.reduce((a, b) => a + b, 0) / confidences.length;
  const min = Math.min(...confidences);
  const max = Math.max(...confidences);

  return { mean, min, max };
}

export default {
  predictNextLocation,
  batchPredict,
  getPredictionStats,
};

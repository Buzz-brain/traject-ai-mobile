/**
 * LSTM Prediction Service
 * Handles GPS sequence prediction for trajectory estimation
 * 
 * Phase 1: Stubs and function signatures
 * Phase 2: Full implementation with TensorFlow.js
 */

import { loadModel } from './modelService';
import { normalizeSequence } from '../utils/scaler';
import { displacementToCoordinates } from '../utils/calculations';
import { HYBRID_CONFIG, MODEL_CONFIG, DEBUG_CONFIG } from '../utils/constants';

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

    // Load model
    const model = await loadModel();
    if (!model) {
      console.error('[PredictionService] Model failed to load');
      return null;
    }

    // Normalize the sequence
    const normalizedSeq = normalizeSequence(gpsOnlyPoints);

    // Run prediction (Phase 2: implement actual TensorFlow.js inference)
    // For now, return stub
    const prediction = await runPrediction(model, normalizedSeq);

    if (!prediction) {
      return null;
    }

    const { dx, dy } = prediction;

    // Calculate confidence (inverse of displacement magnitude)
    // Smaller displacement = higher confidence in short-term prediction
    const displacement = Math.sqrt(dx * dx + dy * dy);
    const confidence = Math.max(0, Math.min(1, 1 - (displacement / 50))); // Normalize to 0-1

    const result = {
      dx: parseFloat(dx.toFixed(2)),
      dy: parseFloat(dy.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(3)),
    };

    if (DEBUG_CONFIG.LOG_AI_PREDICTIONS) {
      console.log('[PredictionService] Prediction:', result);
    }

    return result;
  } catch (error) {
    console.error('[PredictionService] Prediction error:', error);
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
async function runPrediction(model, normalizedSeq) {
  // Phase 2: Implement TensorFlow.js inference
  // const inputTensor = tf.tensor3d([normalizedSeq], [1, 10, 4]);
  // const prediction = model.predict(inputTensor);
  // const predArray = await prediction.array();
  // const [dx, dy] = predArray[0];
  // inputTensor.dispose();
  // prediction.dispose();
  // return { dx, dy };

  // Phase 1: Stub - return zero displacement
  return {
    dx: 0,
    dy: 0,
  };
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

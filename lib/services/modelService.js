/**
 * TensorFlow.js Model Service
 * Handles LSTM model loading and management
 * 
 * Phase 1: Stubs and initialization
 * Phase 2: Full implementation
 */

import * as tf from '@tensorflow/tfjs';
import { MODEL_CONFIG } from '../utils/constants';
import diagnosticsService from './diagnosticsService';

let modelInstance = null;
let modelLoading = null;

/**
 * Load the TensorFlow.js LSTM model from assets
 * Caches the model to avoid reloading
 * @returns {Promise<tf.LayersModel>} The loaded model
 * @throws {Error} If model fails to load
 */
export async function loadModel() {
  // If already loaded, return cached instance
  if (modelInstance) {
    console.log('[ModelService] Returning cached model');
    return modelInstance;
  }

  // If currently loading, wait for existing promise
  if (modelLoading) {
    console.log('[ModelService] Waiting for existing model load...');
    return modelLoading;
  }

  console.log('[ModelService] Starting model load...');
  diagnosticsService.setModelLoading();

  // Create timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Model loading timeout after ${MODEL_CONFIG.MODEL_LOAD_TIMEOUT}ms`));
    }, MODEL_CONFIG.MODEL_LOAD_TIMEOUT);
  });

  try {
    // Load model with timeout protection
    // Load model using RN bundle resources (model json + binary weights)
    const modelJson = MODEL_CONFIG.MODEL_PATH; // require('../../assets/model/model.json')
    // Note: adjust weight filename if different
    const modelWeights = require('../../assets/model/group1-shard1of1.bin');

    modelLoading = Promise.race([
      tf.loadLayersModel(tf.io.bundleResourceIO(modelJson, modelWeights)),
      timeoutPromise,
    ]);

    modelInstance = await modelLoading;
    console.log('[ModelService] Model loaded successfully');
    console.log('[ModelService] Model info:', modelInstance.summary ? 'Summary available' : 'No summary');
    diagnosticsService.setModelLoaded();
    return modelInstance;
  } catch (error) {
    console.error('[ModelService] Failed to load model:', error);
    diagnosticsService.setModelError(error);
    modelLoading = null;
    throw error;
  }
}

/**
 * Check if model is loaded
 * @returns {boolean} True if model is loaded and ready
 */
export function isModelLoaded() {
  return modelInstance !== null;
}

/**
 * Dispose of the model to free memory
 * Call this when model is no longer needed
 */
export function disposeModel() {
  if (modelInstance) {
    console.log('[ModelService] Disposing model...');
    modelInstance.dispose();
    modelInstance = null;
  }
}

/**
 * Get the loaded model instance
 * @returns {tf.LayersModel | null} The model or null if not loaded
 */
export function getModel() {
  return modelInstance;
}

/**
 * Get model metadata/info
 * @returns {Object} Model information
 */
export function getModelInfo() {
  if (!modelInstance) {
    return {
      loaded: false,
      message: 'Model not loaded',
    };
  }

  return {
    loaded: true,
    sequenceLength: MODEL_CONFIG.SEQUENCE_LENGTH,
    numFeatures: MODEL_CONFIG.NUM_FEATURES,
    scalerParams: MODEL_CONFIG.SCALER,
  };
}

export default {
  loadModel,
  isModelLoaded,
  disposeModel,
  getModel,
  getModelInfo,
};

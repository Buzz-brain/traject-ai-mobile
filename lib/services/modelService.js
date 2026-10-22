import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { MODEL_CONFIG } from '../utils/constants';
import diagnosticsService from './diagnosticsService';

let modelInstance = null;
let modelLoading = null;

export async function loadModel() {
  if (modelInstance) {
    return modelInstance;
  }

  if (modelLoading) {
    return modelLoading;
  }

  console.log('[ModelService] Starting model load...');
  diagnosticsService.setModelLoading();

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Model loading timeout after ${MODEL_CONFIG.MODEL_LOAD_TIMEOUT}ms`));
    }, MODEL_CONFIG.MODEL_LOAD_TIMEOUT);
  });

  try {
    await tf.ready();
    console.log('[ModelService] TF.js backend ready:', tf.getBackend());

    const modelJson = MODEL_CONFIG.MODEL_PATH;

    // Download weights asset to get a local file:// URI
    const weightsAssetId = require('../../assets/model/group1-shard1of1.bin');
    const weightsAsset = Asset.fromModule(weightsAssetId);
    await weightsAsset.downloadAsync();

    if (!weightsAsset.localUri) {
      throw new Error('Weights asset downloaded but localUri is null');
    }

    // Read the weights file directly as an ArrayBuffer
    // using expo-file-system's new File API
    const weightsFile = new File(weightsAsset.localUri);
    const weightData = await weightsFile.arrayBuffer();

    // Build model artifacts compatible with tf.io.fromMemory
    const modelArtifacts = {
      modelTopology: modelJson.modelTopology,
      weightSpecs: modelJson.weightsManifest[0].weights,
      weightData,
      format: modelJson.format,
      generatedBy: modelJson.generatedBy,
      convertedBy: modelJson.convertedBy,
      trainingConfig: modelJson.trainingConfig,
    };

    modelLoading = Promise.race([
      tf.loadLayersModel(tf.io.fromMemory(modelArtifacts)),
      timeoutPromise,
    ]);

    modelInstance = await modelLoading;
    console.log('[ModelService] Model loaded successfully');
    diagnosticsService.setModelLoaded();
    return modelInstance;
  } catch (error) {
    console.error('[ModelService] Failed to load model:', error);
    diagnosticsService.setModelError(error);
    modelLoading = null;
    throw error;
  }
}

export function isModelLoaded() {
  return modelInstance !== null;
}

export function disposeModel() {
  if (modelInstance) {
    modelInstance.dispose();
    modelInstance = null;
  }
}

export function getModel() {
  return modelInstance;
}

export function getModelInfo() {
  if (!modelInstance) {
    return { loaded: false, message: 'Model not loaded' };
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

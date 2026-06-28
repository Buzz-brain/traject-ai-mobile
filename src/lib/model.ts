import * as tf from '@tensorflow/tfjs';

let modelInstance: tf.LayersModel | null = null;
let modelLoading: Promise<tf.LayersModel> | null = null;

/**
 * Load the TensorFlow.js model.
 * Priority order:
 * 1. If running in React Native with @tensorflow/tfjs-react-native available, try bundleResourceIO from assets.
 * 2. Fallback to web `tf.loadLayersModel('/model/model.json')`.
 * Note: To use the RN bundle loader, place `model.json` and shard files under `assets/model` and ensure they are included in the bundle.
 */
export async function loadModel(): Promise<tf.LayersModel> {
  if (modelInstance) return modelInstance;
  if (modelLoading) return modelLoading;

  modelLoading = (async () => {
    // Try RN bundle loader
    try {
      // Dynamically import tfjs-react-native bundle helper
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const tfjsRN = await import('@tensorflow/tfjs-react-native');
      // Attempt to use bundleResourceIO if available
      const bundleResourceIO = (tfjsRN as any).bundleResourceIO;
      if (bundleResourceIO) {
        // Require the model.json and shard(s) from the bundled assets
        // NOTE: You must copy the real model files into `assets/model` and update the require paths if necessary.
        // Example expects: assets/model/model.json and assets/model/group1-shard1of1.bin
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const modelJson = require('../../../assets/model/model.json');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const modelBin = [require('../../../assets/model/group1-shard1of1.bin')];

        const tfModel = await tf.loadLayersModel(bundleResourceIO(modelJson, modelBin));
        modelInstance = tfModel as tf.LayersModel;
        console.log('[Model] Loaded from RN bundle');
        return modelInstance;
      }
    } catch (rnErr) {
      // Not running in RN or bundle loader unavailable
      // console.warn('[Model] RN bundle load failed:', rnErr.message || rnErr);
    }

    // Fallback to web model loading (served from /model)
    try {
      const m = await tf.loadLayersModel('/model/model.json');
      modelInstance = m as tf.LayersModel;
      console.log('[Model] Loaded via web URL');
      return modelInstance;
    } catch (webErr) {
      console.error('[Model] Failed to load model via web URL:', webErr);
      throw webErr;
    }
  })();

  return modelLoading;
}

export function isModelLoaded(): boolean {
  return modelInstance !== null;
}

export function disposeModel(): void {
  if (modelInstance) {
    modelInstance.dispose();
    modelInstance = null;
  }
}

export function getModel(): tf.LayersModel | null {
  return modelInstance;
}

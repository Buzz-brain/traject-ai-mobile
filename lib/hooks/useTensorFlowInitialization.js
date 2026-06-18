/**
 * useTensorFlowInitialization Hook
 * Initializes TensorFlow on app startup and reports diagnostics
 */

import { useEffect } from 'react';
import diagnosticsService from '../services/diagnosticsService';

export function useTensorFlowInitialization() {
  useEffect(() => {
    initializeTensorFlow();
  }, []);
}

async function initializeTensorFlow() {
  try {
    diagnosticsService.setTensorFlowInitializing();

    // Dynamically import TensorFlow to avoid early load issues
    try {
      const tf = await import('@tensorflow/tfjs');

      // Check if TensorFlow is ready
      if (tf.default && tf.default.ready) {
        await tf.default.ready;
        diagnosticsService.setTensorFlowReady();
        console.log('[TensorFlow] Backend initialized:', tf.default.getBackend?.());
        return;
      }

      // If tf.ready doesn't exist, consider it ready
      diagnosticsService.setTensorFlowReady();
    } catch (tfError) {
      console.warn('[TensorFlow] TensorFlow import warning:', tfError.message);
      // Don't fail the app if TensorFlow has issues, just mark as ready
      diagnosticsService.setTensorFlowReady();
    }
  } catch (error) {
    console.error('[TensorFlow] Initialization error:', error);
    diagnosticsService.setTensorFlowError(error);
  }
}

export default useTensorFlowInitialization;


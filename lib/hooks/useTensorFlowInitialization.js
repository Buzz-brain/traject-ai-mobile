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

    // Try initializing the React Native TF backend first
    try {
      // Import RN bindings
      const tfRN = await import('@tensorflow/tfjs-react-native');
      const tf = await import('@tensorflow/tfjs');

      // Initialize the RN backend
      await tfRN.setBackend('rn-webgl');
      await tf.ready();

      diagnosticsService.setTensorFlowReady();
      console.log('[TensorFlow] RN backend initialized:', tf.getBackend?.());
      return;
    } catch (rnError) {
      console.warn('[TensorFlow] Failed to initialize rn backend, falling back to web tfjs:', rnError.message);
      // Fallback: try plain tfjs
      try {
        const tf = await import('@tensorflow/tfjs');
        if (tf && tf.ready) {
          await tf.ready();
        }
        diagnosticsService.setTensorFlowReady();
        console.log('[TensorFlow] Fallback tfjs initialized');
        return;
      } catch (tfError) {
        console.warn('[TensorFlow] Fallback tfjs import warning:', tfError.message);
        diagnosticsService.setTensorFlowReady();
      }
    }
  } catch (error) {
    console.error('[TensorFlow] Initialization error:', error);
    diagnosticsService.setTensorFlowError(error);
  }
}

export default useTensorFlowInitialization;


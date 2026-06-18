/**
 * AI Diagnostics Service
 * Tracks TensorFlow, model, GPS, and prediction health metrics
 * Provides real-time diagnostics for debugging and monitoring
 */

let diagnosticsState = {
  tensorflowStatus: 'not-initialized',
  tensorflowError: null,
  modelStatus: 'not-loaded',
  modelError: null,
  gpsStatus: 'inactive',
  lastInferenceTime: null,
  lastPredictionCoordinates: null,
  bufferedGpsPoints: 0,
  totalInferences: 0,
  totalPredictionErrors: 0,
  initializationStartTime: null,
  lastInferenceStartTime: null,
};

const diagnosticsListeners = new Set();

function notifyListeners() {
  try {
    diagnosticsListeners.forEach(listener => {
      try {
        listener(diagnosticsState);
      } catch (error) {
        console.error('[Diagnostics] Error in listener:', error);
      }
    });
  } catch (error) {
    console.error('[Diagnostics] Error notifying listeners:', error);
  }
}

export function addDiagnosticsListener(callback) {
  try {
    if (typeof callback === 'function') {
      diagnosticsListeners.add(callback);
      return () => diagnosticsListeners.delete(callback);
    }
  } catch (error) {
    console.error('[Diagnostics] Error adding listener:', error);
  }
  return () => {};
}

export function getDiagnosticsState() {
  try {
    return { ...diagnosticsState };
  } catch (error) {
    console.error('[Diagnostics] Error getting state:', error);
    return { ...diagnosticsState };
  }
}

export function setTensorFlowInitializing() {
  try {
    diagnosticsState.tensorflowStatus = 'initializing';
    diagnosticsState.initializationStartTime = Date.now();
    diagnosticsState.tensorflowError = null;
    notifyListeners();
    console.log('[Diagnostics] TensorFlow initializing...');
  } catch (error) {
    console.error('[Diagnostics] Error setting TensorFlow initializing:', error);
  }
}

export function setTensorFlowReady() {
  try {
    const startTime = diagnosticsState.initializationStartTime;
    const elapsed = startTime ? Date.now() - startTime : 0;
    diagnosticsState.tensorflowStatus = 'ready';
    diagnosticsState.tensorflowError = null;
    diagnosticsState.initializationStartTime = null;
    notifyListeners();
    console.log('TensorFlow initialized successfully');
  } catch (error) {
    console.error('[Diagnostics] Error setting TensorFlow ready:', error);
  }
}

export function setTensorFlowError(error) {
  try {
    diagnosticsState.tensorflowStatus = 'failed';
    diagnosticsState.tensorflowError = error?.message || String(error);
    diagnosticsState.initializationStartTime = null;
    notifyListeners();
    console.error('[Diagnostics] TensorFlow initialization error:', error);
  } catch (err) {
    console.error('[Diagnostics] Error setting TensorFlow error:', err);
  }
}

export function setModelLoading() {
  try {
    diagnosticsState.modelStatus = 'loading';
    diagnosticsState.modelError = null;
    notifyListeners();
    console.log('[Diagnostics] Model loading...');
  } catch (error) {
    console.error('[Diagnostics] Error setting model loading:', error);
  }
}

export function setModelLoaded() {
  try {
    diagnosticsState.modelStatus = 'loaded';
    diagnosticsState.modelError = null;
    notifyListeners();
    console.log('TrajectAI model loaded successfully');
  } catch (error) {
    console.error('[Diagnostics] Error setting model loaded:', error);
  }
}

export function setModelError(error) {
  try {
    diagnosticsState.modelStatus = 'failed';
    diagnosticsState.modelError = error?.message || String(error);
    notifyListeners();
    console.error('[Diagnostics] Model loading error:', error);
  } catch (err) {
    console.error('[Diagnostics] Error setting model error:', err);
  }
}

export function setGpsActive() {
  try {
    diagnosticsState.gpsStatus = 'active';
    notifyListeners();
  } catch (error) {
    console.error('[Diagnostics] Error setting GPS active:', error);
  }
}

export function setGpsInactive() {
  try {
    diagnosticsState.gpsStatus = 'inactive';
    notifyListeners();
  } catch (error) {
    console.error('[Diagnostics] Error setting GPS inactive:', error);
  }
}

export function recordInference(lat, lon, inferenceTime) {
  try {
    const now = Date.now();
    diagnosticsState.lastInferenceTime = inferenceTime;
    diagnosticsState.lastPredictionCoordinates = { lat, lon, timestamp: now };
    diagnosticsState.totalInferences += 1;
    notifyListeners();

    console.log('Prediction generated successfully');
    console.log(`Lat: ${lat.toFixed(6)}`);
    console.log(`Lon: ${lon.toFixed(6)}`);
    console.log(`Inference time: ${inferenceTime} ms`);
  } catch (error) {
    console.error('[Diagnostics] Error recording inference:', error);
  }
}

export function recordInferenceError() {
  try {
    diagnosticsState.totalPredictionErrors += 1;
    notifyListeners();
  } catch (error) {
    console.error('[Diagnostics] Error recording inference error:', error);
  }
}

export function updateBufferedGpsPoints(count) {
  try {
    diagnosticsState.bufferedGpsPoints = count;
    notifyListeners();
  } catch (error) {
    console.error('[Diagnostics] Error updating buffered GPS points:', error);
  }
}

export function startInference() {
  try {
    diagnosticsState.lastInferenceStartTime = Date.now();
  } catch (error) {
    console.error('[Diagnostics] Error starting inference:', error);
  }
}

export function getInferenceStartTime() {
  try {
    return diagnosticsState.lastInferenceStartTime;
  } catch (error) {
    console.error('[Diagnostics] Error getting inference start time:', error);
    return null;
  }
}

export function getDiagnosticsSummary() {
  try {
    return {
      tensorflowStatus: diagnosticsState.tensorflowStatus,
      tensorflowError: diagnosticsState.tensorflowError,
      modelStatus: diagnosticsState.modelStatus,
      modelError: diagnosticsState.modelError,
      gpsStatus: diagnosticsState.gpsStatus,
      lastInferenceTime: diagnosticsState.lastInferenceTime,
      lastPredictionCoordinates: diagnosticsState.lastPredictionCoordinates,
      bufferedGpsPoints: diagnosticsState.bufferedGpsPoints,
      totalInferences: diagnosticsState.totalInferences,
      totalPredictionErrors: diagnosticsState.totalPredictionErrors,
    };
  } catch (error) {
    console.error('[Diagnostics] Error getting summary:', error);
    return {};
  }
}

export function resetDiagnostics() {
  try {
    diagnosticsState = {
      tensorflowStatus: 'not-initialized',
      tensorflowError: null,
      modelStatus: 'not-loaded',
      modelError: null,
      gpsStatus: 'inactive',
      lastInferenceTime: null,
      lastPredictionCoordinates: null,
      bufferedGpsPoints: 0,
      totalInferences: 0,
      totalPredictionErrors: 0,
      initializationStartTime: null,
      lastInferenceStartTime: null,
    };
    notifyListeners();
  } catch (error) {
    console.error('[Diagnostics] Error resetting diagnostics:', error);
  }
}

export default {
  addDiagnosticsListener,
  getDiagnosticsState,
  setTensorFlowInitializing,
  setTensorFlowReady,
  setTensorFlowError,
  setModelLoading,
  setModelLoaded,
  setModelError,
  setGpsActive,
  setGpsInactive,
  recordInference,
  recordInferenceError,
  updateBufferedGpsPoints,
  startInference,
  getInferenceStartTime,
  getDiagnosticsSummary,
  resetDiagnostics,
};

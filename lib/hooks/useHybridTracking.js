/**
 * useHybridTracking Hook (STUB)
 * Hybrid GPS + AI tracking with intelligent mode switching
 * 
 * Phase 1: Function signatures and state shape
 * Phase 2: Full implementation with AI prediction logic
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { HYBRID_CONFIG, SESSION_CONFIG } from '../utils/constants';

/**
 * Hybrid tracking state machine
 * Manages GPS signal monitoring and AI prediction triggering
 * @param {Object} options - Configuration options
 * @returns {Object} Hybrid tracking state and controls
 */
export function useHybridTracking(options = {}) {
  const opts = {
    gpsLossThreshold: HYBRID_CONFIG.GPS_LOSS_THRESHOLD,
    accuracyThreshold: HYBRID_CONFIG.ACCURACY_THRESHOLD,
    updateInterval: HYBRID_CONFIG.UPDATE_INTERVAL,
    ...options,
  };

  // State
  const [state, setState] = useState({
    mode: SESSION_CONFIG.MODE_GPS_ONLY,
    gpsSignal: 'good',
    confidence: 'unknown',
    currentPos: null,
    gpsPoints: [],
    predictedPoints: [],
    predictionActive: false,
    gpsLossStart: null,
    accuracy: null,
    gpsPointsCount: 0,
    aiPointsCount: 0,
    switchEvents: [],
    lastModeSwitch: null,
    avgAiConfidence: 0,
  });

  const modelLoadedRef = useRef(false);
  const userModeRef = useRef(null);

  // Initialize model on mount
  useEffect(() => {
    // Phase 2: Load LSTM model
    console.log('[useHybridTracking] Model initialization (stub)');
    modelLoadedRef.current = true;
  }, []);

  /**
   * Update GPS signal quality
   * @param {number} accuracy - GPS accuracy in meters
   */
  const updateGpsSignal = useCallback((accuracy) => {
    // Phase 2: Calculate signal quality
    if (accuracy === null) return 'lost';
    if (accuracy <= opts.accuracyThreshold) return 'good';
    if (accuracy <= 50) return 'weak';
    return 'poor';
  }, [opts.accuracyThreshold]);

  /**
   * Update current position
   */
  const updatePosition = useCallback((lat, lon, accuracy) => {
    const signal = updateGpsSignal(accuracy);
    setState(prev => ({
      ...prev,
      currentPos: { lat, lon },
      accuracy,
      gpsSignal: signal,
      gpsLossStart: signal === 'lost' ? prev.gpsLossStart || Date.now() : null,
    }));
  }, [updateGpsSignal]);

  /**
   * Add a GPS point
   */
  const addGpsPoint = useCallback((lat, lon, accuracy, speed = 0, heading = 0) => {
    const newPoint = {
      lat,
      lon,
      timestamp: new Date().toISOString(),
      speed,
      heading,
      mode: 'tracking',
      source: 'gps',
      accuracy: accuracy ?? undefined,
    };

    setState(prev => {
      const updated = [...prev.gpsPoints, newPoint];
      if (updated.length > 100) {
        updated.shift();
      }
      return {
        ...prev,
        gpsPoints: updated,
        gpsPointsCount: prev.gpsPointsCount + 1,
      };
    });

    updatePosition(lat, lon, accuracy);
  }, [updatePosition]);

  /**
   * Run AI prediction
   * Phase 2: Implement actual LSTM prediction
   */
  const runPrediction = useCallback(async () => {
    // Phase 2: Call predictNextLocation from predictionService
    console.log('[useHybridTracking] Prediction (stub)');
  }, []);

  /**
   * Set tracking mode
   */
  const setTrackingMode = useCallback((mode) => {
    if (mode !== SESSION_CONFIG.MODE_GPS_ONLY &&
        mode !== SESSION_CONFIG.MODE_AI_ONLY &&
        mode !== SESSION_CONFIG.MODE_HYBRID) {
      console.warn('[useHybridTracking] Invalid mode:', mode);
      return;
    }

    userModeRef.current = mode;
    setState(prev => ({
      ...prev,
      mode,
      switchEvents: [
        ...prev.switchEvents,
        {
          timestamp: new Date().toISOString(),
          from: prev.mode,
          to: mode,
        },
      ],
      lastModeSwitch: new Date().toISOString(),
    }));
  }, []);

  return {
    // State
    state,
    // Methods
    addGpsPoint,
    updatePosition,
    setTrackingMode,
    runPrediction,
    updateGpsSignal,
  };
}

export default useHybridTracking;

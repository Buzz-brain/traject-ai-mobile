/**
 * useHybridTracking Hook
 * Hybrid GPS + AI tracking with intelligent mode switching
 * 
 * Monitors GPS signal quality and switches to AI prediction when GPS is lost
 * Tracks mode switches and maintains hybrid tracking statistics
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { HYBRID_CONFIG, SESSION_CONFIG, DEBUG_CONFIG } from '../utils/constants';
import { predictNextLocation } from '../services/predictionService';
import { displacementToCoordinates } from '../utils/calculations';
import { useAsyncStorage } from './useAsyncStorage';
import diagnosticsService from '../services/diagnosticsService';

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
  const predictionIntervalRef = useRef(null);
  const lastPredictionRef = useRef(0);
  const predictionCounterRef = useRef(0);
  const storage = useAsyncStorage();

  // Initialize model on mount
  useEffect(() => {
    // Model will be loaded by predictionService on first prediction
    console.log('[useHybridTracking] Initialized');
    modelLoadedRef.current = true;
  }, []);

  /**
   * Evaluate GPS signal quality
   * @param {number} accuracy - GPS accuracy in meters
   * @returns {string} Signal quality: 'good', 'weak', 'poor', 'lost'
   */
  const updateGpsSignal = useCallback((accuracy) => {
    if (accuracy === null || accuracy === undefined) return 'lost';
    if (accuracy <= opts.accuracyThreshold) return 'good';
    if (accuracy <= 50) return 'weak';
    if (accuracy <= 100) return 'poor';
    return 'lost';
  }, [opts.accuracyThreshold]);

  /**
   * Update current position and GPS signal
   */
  const updatePosition = useCallback((lat, lon, accuracy) => {
    const signal = updateGpsSignal(accuracy);
    setState(prev => {
      const gpsLossStart = signal === 'lost' 
        ? (prev.gpsLossStart || Date.now())
        : null;

      return {
        ...prev,
        currentPos: { lat, lon },
        accuracy,
        gpsSignal: signal,
        gpsLossStart,
      };
    });
  }, [updateGpsSignal]);

  /**
   * Add a GPS point to tracking
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

      diagnosticsService.updateBufferedGpsPoints(updated.length);
      diagnosticsService.setGpsActive();

      return {
        ...prev,
        gpsPoints: updated,
        gpsPointsCount: prev.gpsPointsCount + 1,
      };
    });

    updatePosition(lat, lon, accuracy);
  }, [updatePosition]);

  /**
   * Add an AI-predicted point
   */
  const addAiPoint = useCallback((lat, lon, confidence) => {
    const newPoint = {
      lat,
      lon,
      timestamp: new Date().toISOString(),
      speed: 0,
      heading: 0,
      mode: 'tracking',
      source: 'ai',
      confidence,
      predicted: true,
    };

    setState(prev => {
      const updated = [...prev.predictedPoints, newPoint];
      const totalPoints = updated.length;

      // Calculate average confidence
      const sumConfidence = updated.reduce((sum, p) => sum + (p.confidence || 0), 0);
      const avgConfidence = totalPoints > 0 ? sumConfidence / totalPoints : 0;

      return {
        ...prev,
        predictedPoints: updated,
        aiPointsCount: prev.aiPointsCount + 1,
        avgAiConfidence: parseFloat(avgConfidence.toFixed(3)),
      };
    });
  }, []);

  /**
   * Run AI prediction to generate next point
   */
  const runPrediction = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        predictionActive: true,
      }));

      // Get all points (GPS + predicted)
      const allPoints = [
        ...state.gpsPoints,
        ...state.predictedPoints,
      ];

      if (allPoints.length < 10) {
        console.log('[useHybridTracking] Insufficient points for prediction');
        setState(prev => ({
          ...prev,
          predictionActive: false,
        }));
        return;
      }

      // Get last position
      const lastPoint = allPoints[allPoints.length - 1];
      if (!lastPoint) {
        setState(prev => ({
          ...prev,
          predictionActive: false,
        }));
        return;
      }

      // Predict next location
      const prediction = await predictNextLocation(allPoints);

      if (!prediction || (prediction.dx === 0 && prediction.dy === 0)) {
        if (DEBUG_CONFIG.DEBUG_MODE) {
          console.log('[useHybridTracking] No valid prediction');
        }
        setState(prev => ({
          ...prev,
          predictionActive: false,
        }));
        return;
      }

      // Convert displacement to coordinates
      const nextPos = displacementToCoordinates(
        lastPoint.lat,
        lastPoint.lon,
        prediction.dx,
        prediction.dy
      );

      // Add predicted point
      addAiPoint(nextPos.lat, nextPos.lon, prediction.confidence);

      if (DEBUG_CONFIG.DEBUG_MODE) {
        console.log('[useHybridTracking] Prediction added:', {
          displacement: { dx: prediction.dx, dy: prediction.dy },
          confidence: prediction.confidence,
          nextPos,
        });
      }

      setState(prev => ({
        ...prev,
        predictionActive: false,
      }));
    } catch (error) {
      console.error('[useHybridTracking] Prediction error:', error);
      setState(prev => ({
        ...prev,
        predictionActive: false,
      }));
    }
  }, [state.gpsPoints, state.predictedPoints, addAiPoint]);

  /**
   * Set tracking mode (GPS, AI, or Hybrid)
   */
  const setTrackingMode = useCallback((mode) => {
    if (mode !== SESSION_CONFIG.MODE_GPS_ONLY &&
        mode !== SESSION_CONFIG.MODE_AI_ONLY &&
        mode !== SESSION_CONFIG.MODE_HYBRID) {
      console.warn('[useHybridTracking] Invalid mode:', mode);
      return;
    }

    userModeRef.current = mode;

    setState(prev => {
      const switchEvent = {
        timestamp: new Date().toISOString(),
        from: prev.mode,
        to: mode,
      };

      return {
        ...prev,
        mode,
        switchEvents: [...prev.switchEvents, switchEvent],
        lastModeSwitch: switchEvent.timestamp,
      };
    });

    if (DEBUG_CONFIG.DEBUG_MODE) {
      console.log('[useHybridTracking] Mode switched to:', mode);
    }
  }, []);

  /**
   * Monitor GPS signal and trigger predictions when GPS is lost
   */
  useEffect(() => {
    if (state.gpsLossStart === null) {
      // GPS signal present, clear prediction interval
      if (predictionIntervalRef.current) {
        clearInterval(predictionIntervalRef.current);
        predictionIntervalRef.current = null;
      }
      return;
    }

    const timeSinceGpsLoss = Date.now() - state.gpsLossStart;

    if (timeSinceGpsLoss > opts.gpsLossThreshold) {
      // GPS has been lost too long, start AI predictions
      if (state.mode === SESSION_CONFIG.MODE_GPS_ONLY) {
        setTrackingMode(SESSION_CONFIG.MODE_HYBRID);
      }

      // Start prediction interval if not already running
      if (!predictionIntervalRef.current) {
        predictionIntervalRef.current = setInterval(() => {
          runPrediction();
        }, HYBRID_CONFIG.PREDICTION_INTERVAL);

        if (DEBUG_CONFIG.DEBUG_MODE) {
          console.log('[useHybridTracking] AI prediction interval started');
        }
      }
    }
  }, [
    state.gpsLossStart,
    state.mode,
    opts.gpsLossThreshold,
    setTrackingMode,
    runPrediction,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (predictionIntervalRef.current) {
        clearInterval(predictionIntervalRef.current);
      }
    };
  }, []);

  /**
   * Auto-switch back to GPS when signal returns
   */
  useEffect(() => {
    if (state.gpsSignal === 'good' && state.gpsLossStart === null) {
      if (state.mode === SESSION_CONFIG.MODE_HYBRID) {
        // GPS signal recovered, switch back to GPS only
        setTrackingMode(SESSION_CONFIG.MODE_GPS_ONLY);
        
        if (predictionIntervalRef.current) {
          clearInterval(predictionIntervalRef.current);
          predictionIntervalRef.current = null;
        }

        if (DEBUG_CONFIG.DEBUG_MODE) {
          console.log('[useHybridTracking] Switched back to GPS (signal recovered)');
        }
      }
    }
  }, [state.gpsSignal, state.gpsLossStart, state.mode, setTrackingMode]);

  return {
    // State
    state,
    // Methods
    addGpsPoint,
    addAiPoint,
    updatePosition,
    setTrackingMode,
    runPrediction,
    updateGpsSignal,
  };
}

export default useHybridTracking;

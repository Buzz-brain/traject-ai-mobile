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
import gpsForwarder from '../services/gpsForwarder';
import { displacementToCoordinates } from '../utils/calculations';
import { useAsyncStorage } from './useAsyncStorage';
import diagnosticsService from '../services/diagnosticsService';
import { isModelLoaded, loadModel } from '../services/modelService';

/**
 * Hybrid tracking state machine
 * Manages GPS signal monitoring and AI prediction triggering
 * @param {Object} options - Configuration options
 * @param {Array} options.gpsPoints - Live GPS points array from useLocationTracking (primary source)
 * @returns {Object} Hybrid tracking state and controls
 */
export function useHybridTracking(options = {}) {
  const {
    gpsPoints: externalGpsPoints = [], // ← direct sync from useLocationTracking
    ...hookOptions
  } = options;

  const opts = {
    gpsLossThreshold: HYBRID_CONFIG.GPS_LOSS_THRESHOLD,
    accuracyThreshold: HYBRID_CONFIG.ACCURACY_THRESHOLD,
    updateInterval: HYBRID_CONFIG.UPDATE_INTERVAL,
    ...hookOptions,
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
    modeReady: false, // Becomes true after 10 GPS points collected
    modelStatus: 'idle', // 'idle' | 'loading' | 'loaded' | 'failed'
    lastPrediction: null, // { dx, dy, confidence, timestamp } | null
    predictionMessage: '', // Human-readable status for in-app display
  });

  const modelLoadedRef = useRef(false);
  const modelFailedRef = useRef(false); // Model failed to load — stop retrying
  const lastWarnedCountRef = useRef(-1); // Throttle "insufficient points" warnings
  const userModeRef = useRef(null);
  const predictionIntervalRef = useRef(null);
  const thresholdPollRef = useRef(null); // Polls for GPS loss threshold
  const runPredictionRef = useRef(() => {}); // Always holds latest runPrediction
  const lastPredictionRef = useRef(0);
  const predictionCounterRef = useRef(0);
  const lastGpsTimeRef = useRef(0);
  const userGpsOffRef = useRef(false); // User manually disabled GPS (blocks internal recovery)
  const stateRef = useRef(state); // Always holds latest state for use in intervals/callbacks
  stateRef.current = state;
  const storage = useAsyncStorage();

  // Initialize on mount
  useEffect(() => {
    // Model will be loaded by predictionService on first prediction
    console.log('[useHybridTracking] Initialized');
    modelLoadedRef.current = true;

    // GPS forwarder as fallback — primary sync happens via externalGpsPoints prop
    const off = gpsForwarder.addListener((p) => {
      try {
        addGpsPoint(p.lat, p.lon, p.accuracy ?? null, p.speed ?? 0, p.heading ?? 0);
      } catch (e) {
        console.error('[useHybridTracking] gpsForwarder listener error', e);
      }
    });

    return () => off && off();
  }, [addGpsPoint]);

  /**
   * Sync GPS points from useLocationTracking into internal state.
   * This is the PRIMARY data path — direct prop, no pub/sub lag.
   * When externalGpsPoints has more items than our internal state,
   * merge the new ones in.
   */
  useEffect(() => {
    if (!externalGpsPoints || externalGpsPoints.length === 0) return;

    setState(prev => {
      const internalCount = prev.gpsPoints.length;
      const externalCount = externalGpsPoints.length;

      // If external has new points we haven't seen yet, sync them
      if (externalCount > internalCount) {
        const newPoints = externalGpsPoints.slice(internalCount);
        const updated = [...prev.gpsPoints, ...newPoints];
        if (updated.length > 100) updated.splice(0, updated.length - 100);

        // Update GPS freshness heartbeat for each new point
        const lastPoint = newPoints[newPoints.length - 1];
        if (lastPoint) lastGpsTimeRef.current = Date.now();

        return {
          ...prev,
          gpsPoints: updated,
          gpsPointsCount: prev.gpsPointsCount + newPoints.length,
          modeReady: updated.length >= 10 || prev.modeReady,
        };
      }

      // External was cleared (session reset) — mirror it
      if (externalCount === 0 && internalCount > 0) {
        return {
          ...prev,
          gpsPoints: [],
          gpsPointsCount: 0,
          modeReady: false,
        };
      }

      return prev;
    });
  }, [externalGpsPoints]);

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
    // When user manually disables GPS, override signal to 'lost'
    // regardless of actual incoming GPS data quality.
    const forcedSignal = userGpsOffRef.current ? 'lost' : updateGpsSignal(accuracy);
    setState(prev => {
      const gpsLossStart = forcedSignal === 'lost'
        ? (prev.gpsLossStart || Date.now())
        : null;

      return {
        ...prev,
        currentPos: { lat, lon },
        accuracy,
        gpsSignal: forcedSignal,
        gpsLossStart,
      };
    });
  }, [updateGpsSignal]);

  /**
   * Add a GPS point to tracking
   */
  const addGpsPoint = useCallback((lat, lon, accuracy, speed = 0, heading = 0) => {
    lastGpsTimeRef.current = Date.now();
    setState(prev => {
      // Determine current recording mode
      const recordedMode = prev.mode === SESSION_CONFIG.MODE_GPS_ONLY ? 'GPS_ONLY' : 
                          prev.mode === SESSION_CONFIG.MODE_HYBRID ? 'HYBRID' : 'AI_ONLY';
      
      const newPoint = {
        lat,
        lon,
        timestamp: new Date().toISOString(),
        speed,
        heading,
        mode: 'tracking',
        source: 'gps',
        accuracy: accuracy ?? undefined,
        recordedMode, // Track which mode was active when point was recorded
      };

      const updated = [...prev.gpsPoints, newPoint];
      if (updated.length > 100) {
        updated.shift();
      }

      diagnosticsService.updateBufferedGpsPoints(updated.length);
      diagnosticsService.setGpsActive();

      // Check if we've reached 10 GPS points (threshold for hybrid readiness)
      const newModeReady = updated.length >= 10;

      return {
        ...prev,
        gpsPoints: updated,
        gpsPointsCount: prev.gpsPointsCount + 1,
        modeReady: newModeReady || prev.modeReady,
      };
    });

    updatePosition(lat, lon, accuracy);
  }, [updatePosition]);

  /**
   * Add an AI-predicted point
   */
  const addAiPoint = useCallback((lat, lon, confidence, dx, dy) => {
    setState(prev => {
      // Determine current recording mode
      const recordedMode = prev.mode === SESSION_CONFIG.MODE_GPS_ONLY ? 'GPS_ONLY' : 
                          prev.mode === SESSION_CONFIG.MODE_HYBRID ? 'HYBRID' : 'AI_ONLY';

      const newPoint = {
        lat,
        lon,
        timestamp: new Date().toISOString(),
        speed: 0,
        heading: 0,
        mode: 'tracking',
        source: 'ai',
        confidence,
        dx,
        dy,
        predicted: true,
        recordedMode, // Track which mode was active when point was generated
      };

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
    // Back off if model previously failed to load — avoids error spam
    // every 2 seconds. Only retry if user re-enables GPS then disables again.
    if (modelFailedRef.current) return;

    // Quick check: if model isn't loaded yet, attempt one load then back off
    if (!isModelLoaded()) {
      setState(prev => ({ ...prev, modelStatus: 'loading', predictionMessage: 'Loading model...' }));
      try {
        await loadModel();
        if (isModelLoaded()) {
          setState(prev => ({ ...prev, modelStatus: 'loaded', predictionMessage: 'Model ready' }));
        } else {
          setState(prev => ({ ...prev, modelStatus: 'failed', predictionMessage: 'Model failed to load' }));
          modelFailedRef.current = true;
          return;
        }
      } catch (e) {
        setState(prev => ({
          ...prev,
          modelStatus: 'failed',
          predictionMessage: `Model error: ${e.message}`,
          lastPrediction: { error: e.message, timestamp: new Date().toISOString() },
        }));
        modelFailedRef.current = true;
        console.error('[useHybridTracking] Model unavailable — predictions disabled for this session');
        return;
      }
    }

    try {
      setState(prev => ({
        ...prev,
        predictionActive: true,
        predictionMessage: 'Predicting...',
      }));

      // Use ref for latest state to avoid stale closure
      const currentState = stateRef.current;
      const allPoints = [
        ...currentState.gpsPoints,
        ...currentState.predictedPoints,
      ];

      console.log('[useHybridTracking] Prediction run — allPoints:', allPoints.length, 'gpsPoints:', currentState.gpsPoints.length, 'predictedPoints:', currentState.predictedPoints.length);

      if (allPoints.length < 10) {
        const need = 10 - allPoints.length;
        const msg = `Waiting for ${need} more GPS point${need > 1 ? 's' : ''} (have ${allPoints.length}, need 10)`;
        // Only warn once per point count to avoid log spam
        if (allPoints.length !== lastWarnedCountRef.current) {
          lastWarnedCountRef.current = allPoints.length;
          console.log('[useHybridTracking] Insufficient points for prediction, got', allPoints.length);
        }
        setState(prev => ({
          ...prev,
          predictionActive: false,
          predictionMessage: msg,
        }));
        return;
      }

      // Get last position
      const lastPoint = allPoints[allPoints.length - 1];
      if (!lastPoint) {
        setState(prev => ({
          ...prev,
          predictionActive: false,
          predictionMessage: 'No position data',
        }));
        return;
      }

      // Predict next location
      const prediction = await predictNextLocation(allPoints);

      console.log('[useHybridTracking] Prediction result:', prediction);

      if (!prediction || (prediction.dx === 0 && prediction.dy === 0)) {
        setState(prev => ({
          ...prev,
          predictionActive: false,
          predictionMessage: 'Model returned no displacement',
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

      // Add predicted point with model displacement data
      addAiPoint(nextPos.lat, nextPos.lon, prediction.confidence, prediction.dx, prediction.dy);

      console.log('[useHybridTracking] Prediction added:', {
        displacement: { dx: prediction.dx, dy: prediction.dy },
        confidence: prediction.confidence,
        nextPos,
      });

      const disp = Math.sqrt(prediction.dx ** 2 + prediction.dy ** 2).toFixed(1);
      const pct = Math.round(prediction.confidence * 100);
      setState(prev => ({
        ...prev,
        predictionActive: false,
        predictionMessage: `Predicted: ${disp}m ${pct}% confidence`,
        lastPrediction: {
          dx: prediction.dx,
          dy: prediction.dy,
          confidence: prediction.confidence,
          timestamp: new Date().toISOString(),
        },
        modelStatus: 'loaded',
      }));
    } catch (error) {
      console.error('[useHybridTracking] Prediction error:', error);
      setState(prev => ({
        ...prev,
        predictionActive: false,
        modelStatus: 'failed',
        predictionMessage: `Error: ${error.message}`,
        lastPrediction: { error: error.message, timestamp: new Date().toISOString() },
      }));
      if (error.message && error.message.includes('Cannot find module')) {
        modelFailedRef.current = true;
        console.error('[useHybridTracking] Model file missing — predictions disabled');
      }
    }
  }, [addAiPoint]);

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

  // Keep runPredictionRef in sync so interval always calls latest
  useEffect(() => {
    runPredictionRef.current = runPrediction;
  }, [runPrediction]);

  /**
   * Toggle simulated GPS loss — lets the user test AI predictions
   * without physically blocking GPS signal.
   * When enabled, forces gpsLossStart so the AI monitoring effect
   * kicks in immediately. Overrides the internal freshness monitor
   * so it won't auto-recover while GPS is still streaming.
   */
  const toggleSimulatedGps = useCallback((forceOff) => {
    const turningOff = forceOff !== undefined ? forceOff : !userGpsOffRef.current;
    userGpsOffRef.current = turningOff;

    if (turningOff) {
      // Force GPS loss — start AI predictions immediately
      setState(prev => {
        const switchEvent = {
          timestamp: new Date().toISOString(),
          from: prev.mode,
          to: SESSION_CONFIG.MODE_HYBRID,
        };
        const gpsAvailable = prev.gpsPoints.length;
        const initialMsg = gpsAvailable >= 10
          ? 'AI mode active — predicting...'
          : `AI mode active — need ${10 - gpsAvailable} more GPS points`;
        console.log('[useHybridTracking] GPS manually disabled by user');
        return {
          ...prev,
          gpsLossStart: Date.now(),
          gpsSignal: 'lost',
          mode: SESSION_CONFIG.MODE_HYBRID,
          predictionMessage: initialMsg,
          switchEvents: [...prev.switchEvents, switchEvent],
          lastModeSwitch: switchEvent.timestamp,
        };
      });

      // Start prediction interval immediately (bypass threshold wait)
      if (!predictionIntervalRef.current) {
        predictionIntervalRef.current = setInterval(() => {
          runPredictionRef.current();
        }, HYBRID_CONFIG.PREDICTION_INTERVAL);
        console.log('[useHybridTracking] AI prediction interval started (manual toggle)');
      }

      // Fire first prediction immediately
      runPredictionRef.current();
    } else {
      // Re-enable GPS — clear the forced loss so internal monitoring resumes
      userGpsOffRef.current = false;

      if (predictionIntervalRef.current) {
        clearInterval(predictionIntervalRef.current);
        predictionIntervalRef.current = null;
      }

      setState(prev => {
        console.log('[useHybridTracking] GPS re-enabled by user');
        return {
          ...prev,
          gpsLossStart: null,
          gpsSignal: prev.accuracy != null ? updateGpsSignal(prev.accuracy) : 'good',
        };
      });
    }
  }, [updateGpsSignal]);

  /**
   * Monitor GPS signal and trigger predictions when GPS is lost.
   * When gpsLossStart is set, a polling interval keeps checking every 1s
   * until the threshold elapses — avoids the "once and done" bug where
   * the check only fires at the moment gpsLossStart changes (~0ms elapsed).
   */
  useEffect(() => {
    if (state.gpsLossStart === null) {
      if (thresholdPollRef.current) {
        clearInterval(thresholdPollRef.current);
        thresholdPollRef.current = null;
      }
      if (predictionIntervalRef.current) {
        clearInterval(predictionIntervalRef.current);
        predictionIntervalRef.current = null;
      }
      return;
    }

    const timeSinceGpsLoss = Date.now() - state.gpsLossStart;

    if (timeSinceGpsLoss > opts.gpsLossThreshold) {
      // GPS has been lost long enough — start AI predictions
      if (thresholdPollRef.current) {
        clearInterval(thresholdPollRef.current);
        thresholdPollRef.current = null;
      }

      if (state.mode === SESSION_CONFIG.MODE_GPS_ONLY) {
        setTrackingMode(SESSION_CONFIG.MODE_HYBRID);
      }

      if (!predictionIntervalRef.current) {
        predictionIntervalRef.current = setInterval(() => {
          runPredictionRef.current();
        }, HYBRID_CONFIG.PREDICTION_INTERVAL);

        if (DEBUG_CONFIG.DEBUG_MODE) {
          console.log('[useHybridTracking] AI prediction interval started (GPS loss)');
        }
      }
    } else if (!thresholdPollRef.current) {
      // Threshold not yet reached — poll every 1s and check directly
      thresholdPollRef.current = setInterval(() => {
        if (Date.now() - state.gpsLossStart > opts.gpsLossThreshold) {
          if (thresholdPollRef.current) {
            clearInterval(thresholdPollRef.current);
            thresholdPollRef.current = null;
          }
          if (state.mode === SESSION_CONFIG.MODE_GPS_ONLY) {
            setTrackingMode(SESSION_CONFIG.MODE_HYBRID);
          }
          if (!predictionIntervalRef.current) {
            predictionIntervalRef.current = setInterval(() => {
              runPredictionRef.current();
            }, HYBRID_CONFIG.PREDICTION_INTERVAL);
          }
        }
      }, 1000);
    }
  }, [
    state.gpsLossStart,
    state.mode,
    opts.gpsLossThreshold,
    setTrackingMode,
  ]);

  /**
   * GPS freshness monitor — catches silent GPS loss.
   * When the user turns off location at the OS level, watchPositionAsync
   * stops delivering updates without an error. This interval detects the
   * absence of new data and sets gpsLossStart so the existing monitoring
   * effect above can switch to AI mode.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastGpsTimeRef.current === 0) return;

      const timeSinceLastGps = Date.now() - lastGpsTimeRef.current;
      if (timeSinceLastGps > opts.gpsLossThreshold) {
        setState(prev => {
          if (prev.gpsLossStart === null) {
            console.log('[useHybridTracking] GPS stale — no data for', opts.gpsLossThreshold, 'ms');
            return { ...prev, gpsLossStart: Date.now() };
          }
          return prev;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [opts.gpsLossThreshold]);

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
    toggleSimulatedGps,
  };
}

export default useHybridTracking;

/**
 * useLocationTracking Hook
 * GPS location tracking and data collection with expo-location
 * Implements GPS filtering, smoothing, and spike detection
 * Migrated algorithm from web version (verified correct)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { GPS_CONFIG, SESSION_CONFIG } from '../utils/constants';
import { haversineDistance, calculateHeading, generateSessionId } from '../utils/calculations';
import { useAsyncStorage } from './useAsyncStorage';

/**
 * Hook for GPS location tracking
 * Manages GPS data collection, filtering, and smoothing buffer
 * @returns {Object} Tracking state and controls
 */
export function useLocationTracking() {
  const [points, setPoints] = useState([]);
  const [status, setStatus] = useState(SESSION_CONFIG.STATUS_IDLE);
  const [currentPos, setCurrentPos] = useState(null);
  const [currentAccuracy, setCurrentAccuracy] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const sessionIdRef = useRef(generateSessionId());
  const startTimeRef = useRef(0);
  
  // Filtering state
  const smoothingBufferRef = useRef([]);
  const lastAvgRef = useRef(null);
  const lastSaveTimeRef = useRef(0);
  const accDistRef = useRef(0);

  // Storage
  const storage = useAsyncStorage();

  // Request location permission
  const requestPermission = useCallback(async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        setError('Location permission denied');
        setPermissionGranted(false);
        console.error('[useLocationTracking] Permission denied:', foregroundStatus);
        return false;
      }

      // Request background permission as well
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus === 'granted') {
        console.log('[useLocationTracking] Background location permission granted');
      }

      setPermissionGranted(true);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('[useLocationTracking] Permission request error:', err);
      return false;
    }
  }, []);

  /**
   * Process GPS position with filtering and smoothing
   */
  const handlePosition = useCallback(
    (position) => {
      try {
        const { latitude, longitude, speed, accuracy } = position.coords;
        const now = Date.now();

        // Update current position and accuracy
        setCurrentPos({ lat: latitude, lon: longitude });
        setCurrentAccuracy(accuracy);

        // Ignore low-accuracy fixes
        if (accuracy > GPS_CONFIG.MAX_ACCEPTABLE_ACCURACY) {
          console.log('[useLocationTracking] Ignoring low accuracy:', accuracy);
          return;
        }

        const timeDiff = now - lastSaveTimeRef.current;

        // Add to smoothing buffer
        const buf = smoothingBufferRef.current;
        buf.push({ lat: latitude, lon: longitude });
        if (buf.length > GPS_CONFIG.SMOOTHING_BUFFER_SIZE) {
          buf.shift();
        }

        // Compute averaged position from buffer
        const avg = buf.reduce(
          (acc, p) => ({ lat: acc.lat + p.lat, lon: acc.lon + p.lon }),
          { lat: 0, lon: 0 }
        );
        const avgCount = buf.length || 1;
        const avgLat = avg.lat / avgCount;
        const avgLon = avg.lon / avgCount;

        // Calculate distance and heading from last averaged position
        let distFromLast = 0;
        let heading = 0;
        const lastAvg = lastAvgRef.current;
        if (lastAvg) {
          distFromLast = haversineDistance(
            lastAvg.lat,
            lastAvg.lon,
            avgLat,
            avgLon
          );
          heading = calculateHeading(
            lastAvg.lat,
            lastAvg.lon,
            avgLat,
            avgLon
          );
        }

        // Ignore GPS spikes
        if (lastAvg && distFromLast > GPS_CONFIG.MAX_STEP_DISTANCE) {
          console.log('[useLocationTracking] Spike detected, ignoring:', distFromLast);
          return;
        }

        // Calculate speed
        const computedSpeed = speed != null ? speed : (lastAvg && timeDiff > 0) 
          ? distFromLast / (timeDiff / 1000) 
          : 0;

        // Decision: should we save this point?
        const shouldSave =
          !lastAvg ||
          (distFromLast >= GPS_CONFIG.SMALL_STEP_THRESHOLD &&
            distFromLast <= GPS_CONFIG.MAX_STEP_DISTANCE) ||
          (timeDiff >= GPS_CONFIG.MIN_INTERVAL_MS &&
            computedSpeed > GPS_CONFIG.MIN_SPEED_MPS);

        if (!shouldSave) {
          return;
        }

        // Update tracking state
        const moving = computedSpeed > GPS_CONFIG.MIN_SPEED_MPS ||
          distFromLast >= GPS_CONFIG.SMALL_STEP_THRESHOLD;
        
        setCurrentSpeed(moving ? computedSpeed : 0);

        // Create point
        const newPoint = {
          lat: parseFloat(avgLat.toFixed(7)),
          lon: parseFloat(avgLon.toFixed(7)),
          timestamp: new Date().toISOString(),
          speed: parseFloat((moving ? computedSpeed : 0).toFixed(2)),
          heading: parseFloat(heading.toFixed(1)),
          mode: SESSION_CONFIG.MODE_GPS_ONLY,
          source: 'gps',
          accuracy: parseFloat(accuracy.toFixed(2)),
        };

        lastAvgRef.current = { lat: avgLat, lon: avgLon };
        lastSaveTimeRef.current = now;

        // Accumulate distance
        if (
          lastAvg &&
          moving &&
          distFromLast >= GPS_CONFIG.SMALL_STEP_THRESHOLD &&
          distFromLast <= GPS_CONFIG.MAX_STEP_DISTANCE
        ) {
          accDistRef.current += distFromLast;
          setTotalDistance(accDistRef.current);
        }

        // Save point
        setPoints((prev) => {
          const updated = [...prev, newPoint];
          // Save to storage
          storage.savePoints(updated, sessionIdRef.current, SESSION_CONFIG.MODE_GPS_ONLY);
          return updated;
        });
      } catch (err) {
        console.error('[useLocationTracking] Error handling position:', err);
        setError(err.message);
      }
    },
    [storage]
  );

  /**
   * Start tracking
   */
  const startRecording = useCallback(async () => {
    try {
      if (!permissionGranted) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      console.log('[useLocationTracking] Starting tracking');
      setStatus(SESSION_CONFIG.STATUS_RECORDING);
      setError(null);

      // Reset timing
      startTimeRef.current = Date.now();
      accDistRef.current = 0;
      smoothingBufferRef.current = [];
      lastAvgRef.current = null;
      lastSaveTimeRef.current = 0;

      // Start timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setDuration(
          Math.floor((Date.now() - startTimeRef.current) / 1000)
        );
      }, 1000);

      // Start location watching
      watchIdRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: GPS_CONFIG.MIN_INTERVAL_MS,
          distanceInterval: 0, // Report all updates, we filter ourselves
        },
        handlePosition
      );

      console.log('[useLocationTracking] Tracking started successfully');
    } catch (err) {
      console.error('[useLocationTracking] Error starting tracking:', err);
      setError(err.message);
      setStatus(SESSION_CONFIG.STATUS_IDLE);
    }
  }, [permissionGranted, requestPermission, handlePosition]);

  /**
   * Pause tracking
   */
  const pauseTracking = useCallback(async () => {
    try {
      if (watchIdRef.current) {
        watchIdRef.current.remove();
        watchIdRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setStatus(SESSION_CONFIG.STATUS_PAUSED);
      console.log('[useLocationTracking] Tracking paused');
    } catch (err) {
      console.error('[useLocationTracking] Error pausing tracking:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Resume tracking
   */
  const resumeTracking = useCallback(async () => {
    try {
      if (!permissionGranted) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      console.log('[useLocationTracking] Resuming tracking');
      setStatus(SESSION_CONFIG.STATUS_RECORDING);

      // Restart timer from current duration
      if (timerRef.current) clearInterval(timerRef.current);
      const pausedDuration = duration;
      const pauseStartTime = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(pausedDuration + Math.floor((Date.now() - pauseStartTime) / 1000));
      }, 1000);

      // Restart location watching
      watchIdRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: GPS_CONFIG.MIN_INTERVAL_MS,
          distanceInterval: 0,
        },
        handlePosition
      );

      console.log('[useLocationTracking] Tracking resumed');
    } catch (err) {
      console.error('[useLocationTracking] Error resuming tracking:', err);
      setError(err.message);
      setStatus(SESSION_CONFIG.STATUS_PAUSED);
    }
  }, [permissionGranted, requestPermission, handlePosition, duration]);

  /**
   * Stop tracking
   */
  const stopTracking = useCallback(async () => {
    try {
      if (watchIdRef.current) {
        watchIdRef.current.remove();
        watchIdRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setStatus(SESSION_CONFIG.STATUS_STOPPED);
      console.log('[useLocationTracking] Tracking stopped');
    } catch (err) {
      console.error('[useLocationTracking] Error stopping tracking:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Reset session
   */
  const reset = useCallback(async () => {
    try {
      await pauseTracking();
      setPoints([]);
      setStatus(SESSION_CONFIG.STATUS_IDLE);
      setCurrentPos(null);
      setCurrentAccuracy(null);
      setCurrentSpeed(0);
      setTotalDistance(0);
      setDuration(0);
      setError(null);
      sessionIdRef.current = generateSessionId();
      accDistRef.current = 0;
      smoothingBufferRef.current = [];
      lastAvgRef.current = null;
      lastSaveTimeRef.current = 0;
      console.log('[useLocationTracking] Reset complete');
    } catch (err) {
      console.error('[useLocationTracking] Error resetting:', err);
      setError(err.message);
    }
  }, [pauseTracking]);

  /**
   * Set active session
   */
  const setSession = useCallback((sessionId) => {
    sessionIdRef.current = sessionId;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        watchIdRef.current.remove();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    // State
    points,
    status,
    currentPos,
    currentAccuracy,
    currentSpeed,
    totalDistance,
    duration,
    error,
    permissionGranted,
    // Methods
    requestPermission,
    startRecording,
    pauseTracking,
    resumeTracking,
    stopTracking,
    reset,
    setSession,
  };
}

export default useLocationTracking;

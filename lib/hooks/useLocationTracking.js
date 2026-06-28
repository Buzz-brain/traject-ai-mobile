/**
 * useLocationTracking Hook
 * GPS location tracking with stationary filtering, smoothing, and spike detection.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import * as Location from "expo-location";
import { GPS_CONFIG, SESSION_CONFIG } from "../utils/constants";
import {
  haversineDistance,
  calculateHeading,
  generateSessionId,
} from "../utils/calculations";
import { useAsyncStorage } from "./useAsyncStorage";
import gpsForwarder from "../services/gpsForwarder";

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
  const [gpsReady, setGpsReady] = useState(null); // null | 'warming' | 'ready' | 'weak' | 'poor' | 'unavailable'

  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const sessionIdRef = useRef(generateSessionId());
  const startTimeRef = useRef(0);

  // Filtering state
  const smoothingBufferRef = useRef([]); // raw readings window
  const stationaryWindowRef = useRef([]); // smoothed positions window (for spread check)
  const lastSavedPosRef = useRef(null); // last position we actually saved
  const lastSaveTimeRef = useRef(0);
  const lastHeartbeatRef = useRef(0);
  const accDistRef = useRef(0);

  const storage = useAsyncStorage();

  // -------------------------------------------------------------------------
  // Permission
  // -------------------------------------------------------------------------
  const requestPermission = useCallback(async () => {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== "granted") {
        setError("Location permission denied");
        setPermissionGranted(false);
        return false;
      }
      await Location.requestBackgroundPermissionsAsync().catch(() => {});
      setPermissionGranted(true);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  // -------------------------------------------------------------------------
  // GPS warmup — one-shot fix on mount so the chip converges before user
  // presses Start. Updates currentAccuracy/currentPos so the UI can show
  // signal quality immediately.
  // -------------------------------------------------------------------------
  const warmupGps = useCallback(async () => {
    setGpsReady('warming');
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setGpsReady('unavailable');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 20000,
      });
      const { latitude, longitude, accuracy } = position.coords;
      setCurrentPos({ lat: latitude, lon: longitude });
      setCurrentAccuracy(accuracy);
      setGpsReady(accuracy <= 20 ? 'good' : accuracy <= 50 ? 'weak' : 'poor');
    } catch {
      setGpsReady('unavailable');
    }
  }, []);

  // Start warmup once permission is granted
  useEffect(() => {
    if (permissionGranted) {
      warmupGps();
    } else {
      setGpsReady(null);
    }
  }, [permissionGranted, warmupGps]);

  // -------------------------------------------------------------------------
  // Stationary detection
  // Checks the spread of the last N smoothed positions.
  // If all of them are within STATIONARY_RADIUS of the oldest, the device
  // hasn't moved meaningfully and we suppress the save.
  // -------------------------------------------------------------------------
  const isStationary = useCallback((smoothedLat, smoothedLon) => {
    const win = stationaryWindowRef.current;

    // Add latest smoothed position
    win.push({ lat: smoothedLat, lon: smoothedLon });
    if (win.length > GPS_CONFIG.STATIONARY_WINDOW) {
      win.shift();
    }

    if (win.length < GPS_CONFIG.STATIONARY_WINDOW) {
      // Not enough history yet — don't assume stationary
      return false;
    }

    const origin = win[0];
    const maxSpread = Math.max(
      ...win.map((p) =>
        haversineDistance(origin.lat, origin.lon, p.lat, p.lon),
      ),
    );

    return maxSpread < GPS_CONFIG.STATIONARY_RADIUS;
  }, []);

  // -------------------------------------------------------------------------
  // Core position handler
  // -------------------------------------------------------------------------
  const handlePosition = useCallback(
    (position) => {
      try {
        const { latitude, longitude, speed, accuracy } = position.coords;
        const now = Date.now();

        setCurrentPos({ lat: latitude, lon: longitude });
        setCurrentAccuracy(accuracy);

        // --- Gate 1: accuracy ---
        // Drop fixes worse than MAX_ACCEPTABLE_ACCURACY outright.
        if (accuracy == null || accuracy > GPS_CONFIG.MAX_ACCEPTABLE_ACCURACY) {
          return;
        }

        // --- Smoothing buffer (average raw readings) ---
        const buf = smoothingBufferRef.current;
        buf.push({ lat: latitude, lon: longitude });
        if (buf.length > GPS_CONFIG.SMOOTHING_BUFFER_SIZE) {
          buf.shift();
        }

        const sum = buf.reduce(
          (acc, p) => ({ lat: acc.lat + p.lat, lon: acc.lon + p.lon }),
          { lat: 0, lon: 0 },
        );
        const avgLat = sum.lat / buf.length;
        const avgLon = sum.lon / buf.length;

        // --- Gate 2: stationary spread check ---
        // Even if one reading drifted 5m, if the whole window stays within
        // STATIONARY_RADIUS we treat the device as stationary.
        const stationary = isStationary(avgLat, avgLon);

        // GPS Doppler speed is the gold standard for actual movement.
        // When the chip reports speed >= MIN_SPEED_MPS, override stationary=false.
        // When speed is available and low, reinforce stationary=true.
        const gpsSpeed = position.coords.speed;
        const deviceMoving = gpsSpeed != null && gpsSpeed >= GPS_CONFIG.MIN_SPEED_MPS;
        const isEffectivelyStationary = deviceMoving ? false : stationary;

        // --- Distance from last SAVED point ---
        const lastSaved = lastSavedPosRef.current;
        const distFromLastSaved = lastSaved
          ? haversineDistance(lastSaved.lat, lastSaved.lon, avgLat, avgLon)
          : Infinity;

        const heading = lastSaved
          ? calculateHeading(lastSaved.lat, lastSaved.lon, avgLat, avgLon)
          : 0;

        // --- Gate 3: spike filter ---
        if (lastSaved && distFromLastSaved > GPS_CONFIG.MAX_STEP_DISTANCE) {
          console.log(
            "[GPS] Spike rejected:",
            distFromLastSaved.toFixed(1),
            "m",
          );
          return;
        }

        // --- Compute speed ---
        const timeSinceLastSave = now - lastSaveTimeRef.current;
        const computedSpeed =
          speed != null
            ? speed
            : lastSaved && timeSinceLastSave > 0
              ? distFromLastSaved / (timeSinceLastSave / 1000)
              : 0;

        const moving = computedSpeed > GPS_CONFIG.MIN_SPEED_MPS;

        setCurrentSpeed(moving ? computedSpeed : 0);

        // --- Gate 4: movement threshold + time gap ---
        // FIX: Previously SMALL_STEP_THRESHOLD was 0.5m (sub-GPS-noise).
        // Now 8m. A point is only saved if the device has moved at least
        // SMALL_STEP_THRESHOLD metres from the last SAVED point AND enough
        // time has passed since the last save.
        const movedEnough =
          distFromLastSaved >= GPS_CONFIG.SMALL_STEP_THRESHOLD;
        const enoughTimePassed =
          timeSinceLastSave >= GPS_CONFIG.MIN_INTERVAL_MS;
        const shouldSaveMovement =
          movedEnough && enoughTimePassed && !isEffectivelyStationary;

        // --- Heartbeat: one point even when stationary so the track has
        //     a timestamp anchor during long pauses ---
        const timeSinceHeartbeat = now - lastHeartbeatRef.current;
        const shouldSaveHeartbeat =
          GPS_CONFIG.HEARTBEAT_INTERVAL_MS > 0 &&
          timeSinceHeartbeat >= GPS_CONFIG.HEARTBEAT_INTERVAL_MS;

        if (!shouldSaveMovement && !shouldSaveHeartbeat) {
          return;
        }

        // --- Build point ---
        const newPoint = {
          lat: parseFloat(avgLat.toFixed(7)),
          lon: parseFloat(avgLon.toFixed(7)),
          timestamp: new Date().toISOString(),
          speed: parseFloat((moving ? computedSpeed : 0).toFixed(2)),
          heading: parseFloat(heading.toFixed(1)),
          mode: SESSION_CONFIG.MODE_GPS_ONLY,
          source: "gps",
          accuracy: parseFloat(accuracy.toFixed(2)),
          isHeartbeat: !shouldSaveMovement, // flag so UI/export can distinguish
        };

        lastSavedPosRef.current = { lat: avgLat, lon: avgLon };
        lastSaveTimeRef.current = now;
        if (shouldSaveHeartbeat) lastHeartbeatRef.current = now;

        // Accumulate distance (only for genuine movement saves)
        if (
          shouldSaveMovement &&
          lastSaved &&
          distFromLastSaved >= GPS_CONFIG.SMALL_STEP_THRESHOLD &&
          distFromLastSaved <= GPS_CONFIG.MAX_STEP_DISTANCE
        ) {
          accDistRef.current += distFromLastSaved;
          setTotalDistance(accDistRef.current);
        }

        // Persist + broadcast
        setPoints((prev) => {
          const updated = [...prev, newPoint];
          storage.savePoints(
            updated,
            sessionIdRef.current,
            SESSION_CONFIG.MODE_GPS_ONLY,
          );
          try {
            gpsForwarder.notifyNewGpsPoint(newPoint);
          } catch (e) {
            console.error("[GPS] gpsForwarder error", e);
          }
          return updated;
        });
      } catch (err) {
        console.error("[GPS] handlePosition error:", err);
        setError(err.message);
      }
    },
    [storage, isStationary],
  );

  // -------------------------------------------------------------------------
  // Start / Pause / Resume / Stop / Reset
  // -------------------------------------------------------------------------
  const startRecording = useCallback(async () => {
    try {
      if (!permissionGranted) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      setStatus(SESSION_CONFIG.STATUS_RECORDING);
      setError(null);
      startTimeRef.current = Date.now();
      accDistRef.current = 0;
      smoothingBufferRef.current = [];
      stationaryWindowRef.current = [];
      lastSavedPosRef.current = null;
      lastSaveTimeRef.current = 0;
      lastHeartbeatRef.current = 0;

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      watchIdRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: GPS_CONFIG.MIN_INTERVAL_MS,
          distanceInterval: 0,
        },
        handlePosition,
      );
    } catch (err) {
      console.error("[GPS] startRecording error:", err);
      setError(err.message);
      setStatus(SESSION_CONFIG.STATUS_IDLE);
    }
  }, [permissionGranted, requestPermission, handlePosition]);

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
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const resumeTracking = useCallback(async () => {
    try {
      if (!permissionGranted) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      setStatus(SESSION_CONFIG.STATUS_RECORDING);

      const pausedDuration = duration;
      const pauseStart = Date.now();
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setDuration(
          pausedDuration + Math.floor((Date.now() - pauseStart) / 1000),
        );
      }, 1000);

      watchIdRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: GPS_CONFIG.MIN_INTERVAL_MS,
          distanceInterval: 0,
        },
        handlePosition,
      );
    } catch (err) {
      setError(err.message);
      setStatus(SESSION_CONFIG.STATUS_PAUSED);
    }
  }, [permissionGranted, requestPermission, handlePosition, duration]);

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
    } catch (err) {
      setError(err.message);
    }
  }, []);

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
      stationaryWindowRef.current = [];
      lastSavedPosRef.current = null;
      lastSaveTimeRef.current = 0;
      lastHeartbeatRef.current = 0;
    } catch (err) {
      setError(err.message);
    }
  }, [pauseTracking]);

  const setSession = useCallback((sessionId) => {
    sessionIdRef.current = sessionId;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (watchIdRef.current) watchIdRef.current.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    points,
    status,
    currentPos,
    currentAccuracy,
    currentSpeed,
    totalDistance,
    duration,
    error,
    permissionGranted,
    gpsReady,
    requestPermission,
    warmupGps,
    startRecording,
    pauseTracking,
    resumeTracking,
    stopTracking,
    reset,
    setSession,
  };
}

export default useLocationTracking;

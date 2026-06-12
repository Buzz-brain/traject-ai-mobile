/**
 * Sensor Fusion Service
 * Handles collection and processing of motion sensors
 * 
 * Phase 1: Sensor data collection stubs
 * Phase 2: Integrate sensor data into prediction pipeline
 */

import { SENSOR_CONFIG } from '../utils/constants';

let accelerometerData = [];
let gyroscopeData = [];
let magnetometerData = [];
let deviceMotionData = [];

/**
 * Initialize sensor data collection
 * Phase 1: Stub
 * @returns {Promise<void>}
 */
export async function initializeSensors() {
  console.log('[SensorService] Sensors initialized (stub)');
  // Phase 2: Start actual sensor subscriptions
}

/**
 * Get latest accelerometer data
 * @returns {Object | null}
 */
export function getAccelerometerData() {
  return accelerometerData.length > 0
    ? accelerometerData[accelerometerData.length - 1]
    : null;
}

/**
 * Get latest gyroscope data
 * @returns {Object | null}
 */
export function getGyroscopeData() {
  return gyroscopeData.length > 0 ? gyroscopeData[gyroscopeData.length - 1] : null;
}

/**
 * Get latest magnetometer data
 * @returns {Object | null}
 */
export function getMagnetometerData() {
  return magnetometerData.length > 0
    ? magnetometerData[magnetometerData.length - 1]
    : null;
}

/**
 * Get latest device motion data
 * @returns {Object | null}
 */
export function getDeviceMotionData() {
  return deviceMotionData.length > 0
    ? deviceMotionData[deviceMotionData.length - 1]
    : null;
}

/**
 * Get all sensor data buffers
 * @returns {Object} All sensor data
 */
export function getAllSensorData() {
  return {
    accelerometer: accelerometerData,
    gyroscope: gyroscopeData,
    magnetometer: magnetometerData,
    deviceMotion: deviceMotionData,
  };
}

/**
 * Clear all sensor buffers
 */
export function clearSensorData() {
  accelerometerData = [];
  gyroscopeData = [];
  magnetometerData = [];
  deviceMotionData = [];
}

/**
 * Stop sensor collection
 */
export async function stopSensors() {
  console.log('[SensorService] Sensors stopped');
  clearSensorData();
}

/**
 * Add accelerometer reading
 * Phase 2: Will be called by sensor subscription
 * @param {Object} data - {x, y, z}
 * @private
 */
export function _addAccelerometerReading(data) {
  accelerometerData.push({...data, timestamp: Date.now()});
  if (accelerometerData.length > SENSOR_CONFIG.SENSOR_BUFFER_SIZE) {
    accelerometerData.shift();
  }
}

/**
 * Add gyroscope reading
 * @param {Object} data - {x, y, z}
 * @private
 */
export function _addGyroscopeReading(data) {
  gyroscopeData.push({...data, timestamp: Date.now()});
  if (gyroscopeData.length > SENSOR_CONFIG.SENSOR_BUFFER_SIZE) {
    gyroscopeData.shift();
  }
}

export default {
  initializeSensors,
  getAccelerometerData,
  getGyroscopeData,
  getMagnetometerData,
  getDeviceMotionData,
  getAllSensorData,
  clearSensorData,
  stopSensors,
};

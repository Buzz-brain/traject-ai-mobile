/**
 * Sensor Service
 * Device sensor data collection and management
 * Handles accelerometer, gyroscope, magnetometer, and device motion
 */

import { Accelerometer, Gyroscope, Magnetometer, DeviceMotion } from 'expo-sensors';
import { SENSOR_CONFIG, DEBUG_CONFIG } from '../utils/constants';

// Sensor data buffers
let accelerometerBuffer = [];
let gyroscopeBuffer = [];
let magnetometerBuffer = [];
let deviceMotionBuffer = [];

// Subscription references
let accelerometerSubscription = null;
let gyroscopeSubscription = null;
let magnetometerSubscription = null;
let deviceMotionSubscription = null;

// Set sensor update intervals (lower is more frequent)
Accelerometer.setUpdateInterval(SENSOR_CONFIG.SENSOR_UPDATE_INTERVAL);
Gyroscope.setUpdateInterval(SENSOR_CONFIG.SENSOR_UPDATE_INTERVAL);
Magnetometer.setUpdateInterval(SENSOR_CONFIG.SENSOR_UPDATE_INTERVAL);
DeviceMotion.setUpdateInterval(SENSOR_CONFIG.SENSOR_UPDATE_INTERVAL);

/**
 * Initialize all sensors with subscriptions
 */
export async function initializeSensors() {
  try {
    console.log('[sensorService] Initializing sensors');

    // Subscribe to accelerometer
    accelerometerSubscription = Accelerometer.addListener(data => {
      _addAccelerometerReading(data);
    });

    // Subscribe to gyroscope
    gyroscopeSubscription = Gyroscope.addListener(data => {
      _addGyroscopeReading(data);
    });

    // Subscribe to magnetometer
    magnetometerSubscription = Magnetometer.addListener(data => {
      _addMagnetometerReading(data);
    });

    // Subscribe to device motion
    deviceMotionSubscription = DeviceMotion.addListener(data => {
      _addDeviceMotionReading(data);
    });

    if (DEBUG_CONFIG.DEBUG_MODE) {
      console.log('[sensorService] Sensors initialized successfully');
    }

    return true;
  } catch (error) {
    console.error('[sensorService] Error initializing sensors:', error);
    return false;
  }
}

/**
 * Get latest accelerometer data
 */
export function getAccelerometerData() {
  if (accelerometerBuffer.length === 0) {
    return { x: 0, y: 0, z: 0, timestamp: Date.now() };
  }
  return accelerometerBuffer[accelerometerBuffer.length - 1];
}

/**
 * Get latest gyroscope data
 */
export function getGyroscopeData() {
  if (gyroscopeBuffer.length === 0) {
    return { x: 0, y: 0, z: 0, timestamp: Date.now() };
  }
  return gyroscopeBuffer[gyroscopeBuffer.length - 1];
}

/**
 * Get latest magnetometer data
 */
export function getMagnetometerData() {
  if (magnetometerBuffer.length === 0) {
    return { x: 0, y: 0, z: 0, timestamp: Date.now() };
  }
  return magnetometerBuffer[magnetometerBuffer.length - 1];
}

/**
 * Get latest device motion data
 */
export function getDeviceMotionData() {
  if (deviceMotionBuffer.length === 0) {
    return {
      acceleration: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      timestamp: Date.now(),
    };
  }
  return deviceMotionBuffer[deviceMotionBuffer.length - 1];
}

/**
 * Get all sensor data
 */
export function getAllSensorData() {
  return {
    accelerometer: getAccelerometerData(),
    gyroscope: getGyroscopeData(),
    magnetometer: getMagnetometerData(),
    deviceMotion: getDeviceMotionData(),
    timestamp: Date.now(),
    bufferSizes: {
      accelerometer: accelerometerBuffer.length,
      gyroscope: gyroscopeBuffer.length,
      magnetometer: magnetometerBuffer.length,
      deviceMotion: deviceMotionBuffer.length,
    },
  };
}

/**
 * Get accelerometer data history
 */
export function getAccelerometerHistory() {
  return [...accelerometerBuffer];
}

/**
 * Get gyroscope data history
 */
export function getGyroscopeHistory() {
  return [...gyroscopeBuffer];
}

/**
 * Get magnetometer data history
 */
export function getMagnetometerHistory() {
  return [...magnetometerBuffer];
}

/**
 * Get device motion data history
 */
export function getDeviceMotionHistory() {
  return [...deviceMotionBuffer];
}

/**
 * Clear all sensor buffers
 */
export function clearSensorData() {
  accelerometerBuffer = [];
  gyroscopeBuffer = [];
  magnetometerBuffer = [];
  deviceMotionBuffer = [];
  console.log('[sensorService] Sensor buffers cleared');
}

/**
 * Stop all sensor subscriptions and cleanup
 */
export function stopSensors() {
  try {
    if (accelerometerSubscription) {
      accelerometerSubscription.remove();
      accelerometerSubscription = null;
    }
    if (gyroscopeSubscription) {
      gyroscopeSubscription.remove();
      gyroscopeSubscription = null;
    }
    if (magnetometerSubscription) {
      magnetometerSubscription.remove();
      magnetometerSubscription = null;
    }
    if (deviceMotionSubscription) {
      deviceMotionSubscription.remove();
      deviceMotionSubscription = null;
    }

    clearSensorData();
    console.log('[sensorService] Sensors stopped and cleaned up');
  } catch (error) {
    console.error('[sensorService] Error stopping sensors:', error);
  }
}

/**
 * Add accelerometer reading to buffer
 * @private
 */
function _addAccelerometerReading(data) {
  const reading = {
    ...data,
    timestamp: Date.now(),
  };

  accelerometerBuffer.push(reading);

  // Keep buffer limited to SENSOR_BUFFER_SIZE
  if (accelerometerBuffer.length > SENSOR_CONFIG.SENSOR_BUFFER_SIZE) {
    accelerometerBuffer.shift();
  }
}

/**
 * Add gyroscope reading to buffer
 * @private
 */
function _addGyroscopeReading(data) {
  const reading = {
    ...data,
    timestamp: Date.now(),
  };

  gyroscopeBuffer.push(reading);

  if (gyroscopeBuffer.length > SENSOR_CONFIG.SENSOR_BUFFER_SIZE) {
    gyroscopeBuffer.shift();
  }
}

/**
 * Add magnetometer reading to buffer
 * @private
 */
function _addMagnetometerReading(data) {
  const reading = {
    ...data,
    timestamp: Date.now(),
  };

  magnetometerBuffer.push(reading);

  if (magnetometerBuffer.length > SENSOR_CONFIG.SENSOR_BUFFER_SIZE) {
    magnetometerBuffer.shift();
  }
}

/**
 * Add device motion reading to buffer
 * @private
 */
function _addDeviceMotionReading(data) {
  const reading = {
    ...data,
    timestamp: Date.now(),
  };

  deviceMotionBuffer.push(reading);

  if (deviceMotionBuffer.length > SENSOR_CONFIG.SENSOR_BUFFER_SIZE) {
    deviceMotionBuffer.shift();
  }
}

/**
 * Get sensor data for ML analysis
 * Combines sensor data into feature vectors for potential future ML integration
 */
export function getSensorFeaturesForML() {
  const accel = getAccelerometerData();
  const gyro = getGyroscopeData();
  const mag = getMagnetometerData();

  return {
    // Accelerometer magnitude (total acceleration)
    accelMagnitude: Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2),
    // Gyroscope magnitude (rotation rate)
    gyroMagnitude: Math.sqrt(gyro.x ** 2 + gyro.y ** 2 + gyro.z ** 2),
    // Magnetometer magnitude (field strength)
    magMagnitude: Math.sqrt(mag.x ** 2 + mag.y ** 2 + mag.z ** 2),
    // Raw values
    accel,
    gyro,
    mag,
    timestamp: Date.now(),
  };
}

export default {
  initializeSensors,
  getAccelerometerData,
  getGyroscopeData,
  getMagnetometerData,
  getDeviceMotionData,
  getAllSensorData,
  getAccelerometerHistory,
  getGyroscopeHistory,
  getMagnetometerHistory,
  getDeviceMotionHistory,
  getSensorFeaturesForML,
  clearSensorData,
  stopSensors,
};

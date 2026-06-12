/**
 * MinMax Scaler for LSTM model input normalization
 * Converts GPS data to normalized values for model prediction
 */

import { MODEL_CONFIG } from './constants';

/**
 * Normalize a single GPS point using MinMaxScaler
 * Formula: (x - min) / (max - min) * scale
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} speed - Speed in m/s
 * @param {number} heading - Heading in degrees
 * @returns {number[]} Normalized values [lat_norm, lon_norm, speed_norm, heading_norm]
 */
export function normalizePoint(lat, lon, speed, heading) {
  const { data_min, data_max } = MODEL_CONFIG.SCALER;
  const values = [lat, lon, speed, heading];
  const normalized = [];

  for (let i = 0; i < 4; i++) {
    // MinMaxScaler formula: (x - min) / (max - min)
    const minMaxNormalized =
      (values[i] - data_min[i]) / (data_max[i] - data_min[i]);
    normalized.push(minMaxNormalized);
  }

  return normalized;
}

/**
 * Normalize a sequence of GPS points
 * @param {Array} points - Array of GPS points
 * @returns {number[][]} 2D array of normalized values
 */
export function normalizeSequence(points) {
  return points.map((p) => normalizePoint(p.lat, p.lon, p.speed, p.heading));
}

/**
 * Denormalize a single value
 * Inverse of MinMaxScaler formula
 * @param {number} normalizedValue - Normalized value (0-1 range)
 * @param {number} index - Feature index (0=lat, 1=lon, 2=speed, 3=heading)
 * @returns {number} Original value
 */
export function denormalizeValue(normalizedValue, index) {
  const { data_min, data_max } = MODEL_CONFIG.SCALER;
  return normalizedValue * (data_max[index] - data_min[index]) + data_min[index];
}

/**
 * Denormalize prediction results
 * @param {number} dx_normalized - Normalized x displacement
 * @param {number} dy_normalized - Normalized y displacement
 * @returns {{dx: number, dy: number}} Denormalized displacement in meters
 */
export function denormalizePrediction(dx_normalized, dy_normalized) {
  // Displacement is typically normalized separately or directly used
  // Here we assume the model outputs are already in the correct scale
  return {
    dx: dx_normalized,
    dy: dy_normalized,
  };
}

/**
 * Validate that GPS values are within expected ranges
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} speed - Speed
 * @param {number} heading - Heading
 * @returns {boolean} True if all values are valid
 */
export function validateGpsValues(lat, lon, speed, heading) {
  const { data_min, data_max } = MODEL_CONFIG.SCALER;
  
  // Check latitude
  if (lat < data_min[0] - 1 || lat > data_max[0] + 1) {
    return false;
  }
  
  // Check longitude
  if (lon < data_min[1] - 1 || lon > data_max[1] + 1) {
    return false;
  }
  
  // Check speed (should be non-negative)
  if (speed < 0 || speed > data_max[2] + 1) {
    return false;
  }
  
  // Check heading (0-360)
  if (heading < 0 || heading > 360) {
    return false;
  }
  
  return true;
}

/**
 * Get scaler parameters
 * @returns {Object} Scaler configuration
 */
export function getScalerParams() {
  return MODEL_CONFIG.SCALER;
}

export default {
  normalizePoint,
  normalizeSequence,
  denormalizeValue,
  denormalizePrediction,
  validateGpsValues,
  getScalerParams,
};

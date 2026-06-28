/**
 * Geographic and utility calculations
 * Reusable functions from web version
 */

import { MAP_CONFIG } from './constants';

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculate bearing/heading between two GPS coordinates
 * Returns heading in degrees (0-360)
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Heading in degrees (0-360)
 */
export function calculateHeading(lat1, lon1, lat2, lon2) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1R = (lat1 * Math.PI) / 180;
  const lat2R = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2R);
  const x =
    Math.cos(lat1R) * Math.sin(lat2R) -
    Math.sin(lat1R) * Math.cos(lat2R) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * Convert displacement (meters) to new GPS coordinates
 * @param {number} lat - Starting latitude
 * @param {number} lon - Starting longitude
 * @param {number} dx - Displacement in x (meters)
 * @param {number} dy - Displacement in y (meters)
 * @returns {{lat: number, lon: number}} New coordinates
 */
export function displacementToCoordinates(lat, lon, dx, dy) {
  const R = 6371000; // Earth radius in meters
  
  // Convert displacement to lat/lon change
  const dLat = dy / R;
  const dLon = dx / (R * Math.cos((lat * Math.PI) / 180));
  
  const newLat = lat + (dLat * 180) / Math.PI;
  const newLon = lon + (dLon * 180) / Math.PI;
  
  return { lat: newLat, lon: newLon };
}

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatDistance(meters) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Format speed for display
 * @param {number} mps - Speed in meters per second
 * @returns {string} Formatted speed string (km/h)
 */
export function formatSpeed(mps) {
  const kph = mps * 3.6;
  return `${kph.toFixed(1)} km/h`;
}

/**
 * Format duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Generate a unique session ID
 * Format: naija_TIMESTAMP_RANDOM
 * @returns {string} Unique session ID
 */
export function generateSessionId() {
  return `naija_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Format timestamp for display
 * @param {string} iso8601 - ISO 8601 timestamp
 * @returns {string} Formatted timestamp
 */
export function formatTimestamp(iso8601) {
  const date = new Date(iso8601);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format date for session list display
 * @param {string} iso8601 - ISO 8601 timestamp
 * @returns {string} Formatted date
 */
export function formatSessionDate(iso8601) {
  const date = new Date(iso8601);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday`;
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
}

/**
 * Calculate average of array values
 * @param {number[]} values - Array of numbers
 * @returns {number} Average value
 */
export function calculateAverage(values) {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

/**
 * Calculate statistics from GPS points
 * @param {Array} points - Array of GPS points
 * @returns {{distance: number, avgSpeed: number, maxSpeed: number, duration: number}}
 */
/**
 * Calculate session statistics from GPS and AI points
 * @param {Array} points - Array of GPS/AI points with lat, lon, timestamp, speed, accuracy, confidence
 * @returns {{distance: number; avgSpeed: number; maxSpeed: number; duration: number; avgAccuracy: number; avgAiConfidence: number}}
 */
export function calculateSessionStats(points) {
  if (points.length < 2) {
    return {
      distance: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      duration: 0,
      avgAccuracy: 0,
      avgAiConfidence: 0,
    };
  }
  
  let totalDistance = 0;
  const speeds = [];
  const accuracies = [];
  const confidences = [];
  
  // Movement detection thresholds (must match GPS_CONFIG)
  const MIN_SPEED_MPS = 0.5;          // m/s - minimum speed threshold
  
  // Calculate distances and speeds between consecutive points
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    
    const distance = haversineDistance(prev.lat, prev.lon, curr.lat, curr.lon);
    
    // Only count distance when the device-reported speed indicates real movement.
    // GPS Doppler speed is 0 when stationary, so this naturally excludes drift.
    // Fall back to computed speed if stored speed is unavailable.
    const storedSpeed = curr.speed || 0;
    const isMoving = storedSpeed > MIN_SPEED_MPS;
    
    if (isMoving && distance <= 20) {
      totalDistance += distance;
    }
    
    if (curr.speed) {
      speeds.push(curr.speed);
    }
    
    // Collect accuracy values
    if (curr.accuracy != null) {
      accuracies.push(curr.accuracy);
    }
    
    // Collect confidence values (from AI predictions)
    if (curr.confidence != null) {
      confidences.push(curr.confidence);
    }
  }
  
  // Calculate duration
  const firstTimestamp = new Date(points[0].timestamp).getTime();
  const lastTimestamp = new Date(points[points.length - 1].timestamp).getTime();
  const duration = (lastTimestamp - firstTimestamp) / 1000;
  
  // Calculate speeds
  const avgSpeed = speeds.length > 0 ? calculateAverage(speeds) : 0;
  const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
  
  // Calculate accuracy average
  const avgAccuracy = accuracies.length > 0 ? calculateAverage(accuracies) : 0;
  
  // Calculate AI confidence average
  const avgAiConfidence = confidences.length > 0 ? calculateAverage(confidences) : 0;
  
  return {
    distance: totalDistance,
    avgSpeed,
    maxSpeed,
    duration,
    avgAccuracy,
    avgAiConfidence,
  };
}

/**
 * Check if point is within reasonable bounds
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} True if within valid bounds
 */
export function isValidCoordinate(lat, lon) {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Convert region delta to zoom level
 * @param {number} latitudeDelta - Latitude delta
 * @returns {number} Approximate zoom level
 */
export function deltaToZoom(latitudeDelta) {
  return Math.round(Math.log2(360 / latitudeDelta));
}

/**
 * Convert zoom level to region delta
 * @param {number} zoom - Zoom level
 * @returns {number} Latitude delta
 */
export function zoomToDelta(zoom) {
  return 360 / Math.pow(2, zoom);
}

export default {
  haversineDistance,
  calculateHeading,
  displacementToCoordinates,
  formatDistance,
  formatSpeed,
  formatDuration,
  generateSessionId,
  formatTimestamp,
  formatSessionDate,
  calculateAverage,
  calculateSessionStats,
  isValidCoordinate,
  deltaToZoom,
  zoomToDelta,
};

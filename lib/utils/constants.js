/**
 * TrajectAI Mobile - Constants Configuration
 * Centralized configuration for the entire application
 */

// ============================================================================
// GPS & LOCATION TRACKING CONSTANTS
// ============================================================================

export const GPS_CONFIG = {
  // Minimum interval between GPS point saves (milliseconds)
  MIN_INTERVAL_MS: 1000,
  
  // Maximum acceptable GPS accuracy (meters)
  // Points with accuracy > this are ignored
  MAX_ACCEPTABLE_ACCURACY: 20,
  
  // Minimum speed threshold (meters per second)
  MIN_SPEED_MPS: 0.5,
  
  // Small step threshold (meters) - ignore sub-meter jitter
  SMALL_STEP_THRESHOLD: 0.5,
  
  // Maximum step distance (meters) - ignore spikes larger than this
  MAX_STEP_DISTANCE: 20,
  
  // Smoothing buffer size (number of points)
  SMOOTHING_BUFFER_SIZE: 3,
  
  // GPS accuracy thresholds for signal quality assessment
  ACCURACY_THRESHOLD_GOOD: 20,   // <= 20m = good
  ACCURACY_THRESHOLD_WEAK: 50,   // <= 50m = weak
  ACCURACY_THRESHOLD_POOR: 100,  // > 100m = poor (fallback to ai)
};

// ============================================================================
// HYBRID TRACKING & AI PREDICTION CONSTANTS
// ============================================================================

export const HYBRID_CONFIG = {
  // GPS loss threshold (milliseconds) before switching to AI
  GPS_LOSS_THRESHOLD: 5000,  // 5 seconds
  
  // Accuracy threshold for "good" GPS (meters)
  ACCURACY_THRESHOLD: 20,
  
  // Update interval for tracking updates (milliseconds)
  UPDATE_INTERVAL: 1000,
  
  // Prediction interval (how often to generate AI predictions)
  PREDICTION_INTERVAL: 2000,
  
  // Minimum GPS points needed for prediction
  MIN_POINTS_FOR_PREDICTION: 10,
  
  // Maximum GPS points to buffer in memory
  MAX_BUFFERED_POINTS: 100,
};

// ============================================================================
// LSTM MODEL & AI CONSTANTS
// ============================================================================

export const MODEL_CONFIG = {
  // Model path in assets
  MODEL_PATH: require('../../assets/model/model.json'),
  
  // Scaler parameters (from trained model)
  SCALER: {
    data_min: [5.3720293, 6.9976181, 0.0, 0.0],
    data_max: [5.3791277, 7.0027822, 3.68, 355.6],
    scale: [140.87681731095535, 193.64458472918787, 0.2717391304347826, 0.00281214848143982],
    feature_names: ['latitude', 'longitude', 'speed', 'heading'],
  },
  
  // Input sequence length
  SEQUENCE_LENGTH: 10,
  
  // Number of features per GPS point
  NUM_FEATURES: 4,
  
  // Model timeout (milliseconds)
  MODEL_LOAD_TIMEOUT: 30000,
};

// ============================================================================
// COLOR THEME CONSTANTS
// ============================================================================

export const COLORS = {
  // Tracking modes
  GPS: '#10b981',      // Emerald green
  AI: '#a855f7',       // Purple
  HYBRID: '#3b82f6',   // Blue
  
  // Status indicators
  SUCCESS: '#10b981',  // Green
  WARNING: '#f59e0b',  // Amber
  ERROR: '#ef4444',    // Red
  
  // Neutral colors
  PRIMARY: '#6366f1',  // Indigo
  SECONDARY: '#64748b', // Slate
  TEXT_DARK: '#1e293b',
  TEXT_LIGHT: '#f1f5f9',
  
  // Backgrounds
  BG_DARK: '#0f172a',
  BG_LIGHT: '#f8fafc',
  SURFACE_DARK: '#1e293b',
  SURFACE_LIGHT: '#ffffff',
  
  // Glassmorphism
  GLASS_LIGHT: 'rgba(255, 255, 255, 0.7)',
  GLASS_DARK: 'rgba(15, 23, 42, 0.7)',
};

// ============================================================================
// UI/UX CONSTANTS
// ============================================================================

export const UI_CONFIG = {
  // Spacing (4px base unit)
  SPACING_XS: 4,
  SPACING_SM: 8,
  SPACING_MD: 12,
  SPACING_LG: 16,
  SPACING_XL: 24,
  SPACING_XXL: 32,
  
  // Border radius
  RADIUS_SM: 8,
  RADIUS_MD: 12,
  RADIUS_LG: 16,
  RADIUS_XL: 24,
  RADIUS_FULL: 999,
  
  // Font sizes
  FONT_XS: 12,
  FONT_SM: 14,
  FONT_MD: 16,
  FONT_LG: 18,
  FONT_XL: 20,
  FONT_2XL: 24,
  FONT_3XL: 32,
  
  // Font weights
  WEIGHT_NORMAL: '400',
  WEIGHT_MEDIUM: '500',
  WEIGHT_SEMIBOLD: '600',
  WEIGHT_BOLD: '700',
  
  // Shadow
  SHADOW_SM: {
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  SHADOW_MD: {
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  SHADOW_LG: {
    shadowColor: 'rgba(0, 0, 0, 0.16)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ============================================================================
// MAP CONSTANTS
// ============================================================================

export const MAP_CONFIG = {
  // Default Nigeria center coordinates
  DEFAULT_CENTER: {
    latitude: 9.082,
    longitude: 8.6753,
  },
  
  // Default zoom level
  DEFAULT_ZOOM: 15,
  
  // Delta (degrees) for initial region
  LATITUDE_DELTA: 0.05,
  LONGITUDE_DELTA: 0.05,
  
  // Polyline configuration
  GPS_POLYLINE_WEIGHT: 3,
  AI_POLYLINE_WEIGHT: 2,
  
  // Animation duration (milliseconds)
  CAMERA_ANIMATION_DURATION: 500,
};

// ============================================================================
// STORAGE CONSTANTS
// ============================================================================

export const STORAGE_CONFIG = {
  // AsyncStorage keys
  STORAGE_KEY_SESSIONS: 'naija-gps-sessions',
  STORAGE_KEY_THEME: 'naija-gps-theme',
  STORAGE_KEY_PREFERENCES: 'naija-gps-preferences',
  STORAGE_KEY_ONBOARDING: 'naija-gps-onboarding-completed',
  
  // Max sessions to keep
  MAX_SESSIONS: 100,
};

// ============================================================================
// ANIMATION CONSTANTS
// ============================================================================

export const ANIMATION_CONFIG = {
  // Duration constants (milliseconds)
  DURATION_FAST: 200,
  DURATION_NORMAL: 300,
  DURATION_SLOW: 500,
  
  // Spring animation config
  SPRING_CONFIG: {
    damping: 10,
    mass: 1,
    stiffness: 100,
    overshootClamping: false,
  },
};

// ============================================================================
// HAPTIC FEEDBACK CONSTANTS
// ============================================================================

export const HAPTIC_CONFIG = {
  ENABLED: true,
  
  // Haptic patterns
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
};

// ============================================================================
// SESSION CONSTANTS
// ============================================================================

export const SESSION_CONFIG = {
  // Session status types
  STATUS_IDLE: 'idle',
  STATUS_RECORDING: 'recording',
  STATUS_PAUSED: 'paused',
  STATUS_STOPPED: 'stopped',
  
  // Tracking modes
  MODE_GPS_ONLY: 'gps_only',
  MODE_AI_ONLY: 'ai_only',
  MODE_HYBRID: 'hybrid',
  
  // Signal quality
  SIGNAL_GOOD: 'good',
  SIGNAL_WEAK: 'weak',
  SIGNAL_POOR: 'poor',
  SIGNAL_LOST: 'lost',
};

// ============================================================================
// SENSOR CONSTANTS (Prepared for future integration)
// ============================================================================

export const SENSOR_CONFIG = {
  // Sensor update intervals (milliseconds)
  ACCELEROMETER_INTERVAL: 100,
  GYROSCOPE_INTERVAL: 100,
  MAGNETOMETER_INTERVAL: 100,
  DEVICE_MOTION_INTERVAL: 100,
  
  // Sensor data buffer size
  SENSOR_BUFFER_SIZE: 50,
};

// ============================================================================
// DEBUG/DEVELOPMENT CONSTANTS
// ============================================================================

export const DEBUG_CONFIG = {
  // Enable debug logging
  ENABLE_LOGGING: true,
  
  // Show sensor data visualization
  SHOW_SENSOR_DEBUG: false,
  
  // Log GPS events
  LOG_GPS_EVENTS: true,
  
  // Log AI predictions
  LOG_AI_PREDICTIONS: true,
};

export default {
  GPS_CONFIG,
  HYBRID_CONFIG,
  MODEL_CONFIG,
  COLORS,
  UI_CONFIG,
  MAP_CONFIG,
  STORAGE_CONFIG,
  ANIMATION_CONFIG,
  HAPTIC_CONFIG,
  SESSION_CONFIG,
  SENSOR_CONFIG,
  DEBUG_CONFIG,
};

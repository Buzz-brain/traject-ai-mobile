/**
 * @typedef {Object} GpsPoint
 * @property {number} lat - Latitude
 * @property {number} lon - Longitude
 * @property {string} timestamp - ISO timestamp
 * @property {number} speed - Speed in m/s
 * @property {number} heading - Heading in degrees (0-360)
 * @property {string} mode - Tracking mode
 * @property {'gps' | 'ai_prediction'} [source] - Data source
 * @property {number} [confidence] - AI prediction confidence (0-1)
 * @property {number} [accuracy] - GPS accuracy in meters
 */

/**
 * @typedef {Object} StoredSession
 * @property {string} sessionId - Unique session identifier
 * @property {string} [sessionName] - User-friendly name
 * @property {string} [mode] - Movement mode
 * @property {string} createdAt - ISO timestamp
 * @property {string} [startedAt] - ISO timestamp when tracking started
 * @property {string} [stoppedAt] - ISO timestamp when tracking stopped
 * @property {GpsPoint[]} points - Array of GPS points
 */

/**
 * @typedef {Object} PredictionResult
 * @property {number} dx - Displacement in x (meters)
 * @property {number} dy - Displacement in y (meters)
 * @property {number} confidence - Confidence score (0-1)
 */

/**
 * @typedef {Object} HybridTrackingState
 * @property {'gps_only' | 'ai_only' | 'hybrid'} mode - Current tracking mode
 * @property {'good' | 'weak' | 'poor' | 'lost'} gpsSignal - GPS signal quality
 * @property {'high' | 'medium' | 'low' | 'unknown'} confidence - Prediction confidence
 * @property {{lat: number, lon: number} | null} currentPos - Current position
 * @property {GpsPoint[]} gpsPoints - Collected GPS points
 * @property {Array<{lat: number, lon: number, timestamp: string, predicted: true}>} predictedPoints - AI predictions
 * @property {boolean} predictionActive - Is AI prediction currently active
 * @property {number | null} gpsLossStart - When GPS was lost (timestamp)
 * @property {number | null} accuracy - Current GPS accuracy
 * @property {number} gpsPointsCount - Total GPS points collected
 * @property {number} aiPointsCount - Total AI predictions made
 * @property {Array<{timestamp: string, from: string, to: string}>} switchEvents - Mode switches
 * @property {string | null} lastModeSwitch - Last mode switch time
 * @property {number} avgAiConfidence - Average AI confidence
 */

/**
 * @typedef {Object} LocationPermission
 * @property {boolean} granted - Permission granted
 * @property {'undetermined' | 'denied' | 'granted'} status - Permission status
 * @property {string} [error] - Error message if any
 */

/**
 * @typedef {'walking' | 'driving' | 'running' | 'bike'} MovementMode
 */

/**
 * @typedef {'gps_only' | 'ai_only' | 'hybrid'} TrackingMode
 */

/**
 * @typedef {'good' | 'weak' | 'poor' | 'lost'} GpsSignalQuality
 */

/**
 * @typedef {'high' | 'medium' | 'low' | 'unknown'} ConfidenceLevel
 */

/**
 * @typedef {'idle' | 'recording' | 'paused' | 'stopped'} RecordingStatus
 */

module.exports = {};

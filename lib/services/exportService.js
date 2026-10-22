/**
 * Export Service
 * Handles session data export in multiple formats
 */

import { calculateSessionStats, formatSessionDate } from '../utils/calculations';

/**
 * Export session as JSON
 * @param {Object} session - Session object
 * @returns {Object} Exported session data
 */
export function exportSessionAsJSON(session) {
  const stats = calculateSessionStats(session.points);

  return {
    session: {
      id: session.sessionId,
      name: session.sessionName || `session_${session.sessionId}`,
      createdAt: session.createdAt,
      startedAt: session.startedAt,
      stoppedAt: session.stoppedAt,
      mode: session.mode,
      exportedAt: new Date().toISOString(),
    },
    statistics: {
      totalPoints: session.points.length,
      gpsPoints: session.points.filter(p => p.source === 'gps' || !p.source).length,
      aiPoints: session.points.filter(p => p.source === 'ai').length,
      totalDistance: stats.distance,
      totalDistanceUnit: 'meters',
      avgSpeed: stats.avgSpeed,
      avgSpeedUnit: 'm/s',
      maxSpeed: stats.maxSpeed,
      maxSpeedUnit: 'm/s',
      duration: stats.duration,
      durationUnit: 'seconds',
    },
    points: session.points.map(p => {
      const base = {
        lat: p.lat,
        lon: p.lon,
        timestamp: p.timestamp,
        speed: p.speed,
        heading: p.heading,
        mode: p.mode,
        source: p.source || 'gps',
        accuracy: p.accuracy,
        recordedMode: p.recordedMode || (p.source === 'ai' ? 'HYBRID' : 'GPS_ONLY'),
      };
      if (p.source === 'ai') {
        base.confidence = p.confidence;
        if (p.dx != null) base.dx = p.dx;
        if (p.dy != null) base.dy = p.dy;
      } else {
        base.confidence = p.confidence;
      }
      return base;
    }),
    ...(session.aiDiagnostics ? { aiDiagnostics: session.aiDiagnostics } : {}),
  };
}

/**
 * Export session as CSV
 * @param {Object} session - Session object
 * @returns {string} CSV formatted data
 */
export function exportSessionAsCSV(session) {
  const hasAiPoints = session.points.some(p => p.source === 'ai');
  const headers = 'lat,lon,timestamp,speed,heading,source,confidence,accuracy,recordedMode' +
    (hasAiPoints ? ',dx,dy' : '') + '\n';
  
  const rows = session.points
    .map(p => [
      p.lat,
      p.lon,
      p.timestamp,
      p.speed,
      p.heading,
      p.source || 'gps',
      p.confidence || '',
      p.accuracy || '',
      p.recordedMode || '',
      ...(hasAiPoints ? [p.dx ?? '', p.dy ?? ''] : []),
    ].join(','))
    .join('\n');

  return headers + rows;
}

/**
 * Export session as GPX (GPS Exchange format)
 * @param {Object} session - Session object
 * @returns {string} GPX formatted data
 */
export function exportSessionAsGPX(session) {
  const timestamp = new Date(session.createdAt).toISOString();
  const points = session.points
    .map(p => `
    <trkpt lat="${p.lat}" lon="${p.lon}">
      <ele>0</ele>
      <time>${p.timestamp}</time>
      <extensions>
        <speed>${p.speed}</speed>
        <heading>${p.heading}</heading>
        <source>${p.source || 'gps'}</source>
        <recordedMode>${p.recordedMode || ''}</recordedMode>
        ${p.confidence ? `<confidence>${p.confidence}</confidence>` : ''}
        ${p.accuracy ? `<accuracy>${p.accuracy}</accuracy>` : ''}
        ${p.dx != null ? `<dx>${p.dx}</dx>` : ''}
        ${p.dy != null ? `<dy>${p.dy}</dy>` : ''}
      </extensions>
    </trkpt>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1">
  <metadata>
    <name>${session.sessionName || 'TrajectAI Session'}</name>
    <desc>Hybrid GPS + AI Tracking Session</desc>
    <time>${timestamp}</time>
  </metadata>
  <trk>
    <name>${session.sessionName || 'TrajectAI Session'}</name>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>`;
}

/**
 * Create summary metadata for export
 * @param {Object} session - Session object
 * @returns {Object} Summary metadata
 */
export function getExportMetadata(session) {
  const stats = calculateSessionStats(session.points);

  return {
    exportDate: new Date().toISOString(),
    appVersion: '1.0.0',
    sessionId: session.sessionId,
    sessionName: session.sessionName,
    createdAt: session.createdAt,
    formattedDate: formatSessionDate(session.createdAt),
    statistics: {
      totalPoints: session.points.length,
      totalDistance: `${(stats.distance / 1000).toFixed(2)} km`,
      duration: formatDuration(stats.duration),
      avgSpeed: `${(stats.avgSpeed * 3.6).toFixed(1)} km/h`,
      maxSpeed: `${(stats.maxSpeed * 3.6).toFixed(1)} km/h`,
    },
  };
}

/**
 * Format duration for export
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default {
  exportSessionAsJSON,
  exportSessionAsCSV,
  exportSessionAsGPX,
  getExportMetadata,
};

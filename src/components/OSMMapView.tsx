import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, Platform } from 'react-native';
let WebView: any;
try {
  WebView = require('react-native-webview').WebView;
} catch (e) {
  WebView = null;
}

type Point = { lat: number; lon: number };

const MAP_HTML = `<!doctype html>
<html>
<head>
<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
<style>
*{margin:0;padding:0}
html,body,#map{height:100%}
#loading{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a2e;color:#94a3b8;font-family:sans-serif;font-size:14px;z-index:999}
#fallback{display:none;position:absolute;top:0;left:0;width:100%;height:100%;background:#1a1a2e}
#grid{position:absolute;top:0;left:0;width:100%;height:100%;stroke:#444;stroke-width:1}
.map-error{display:none;position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.85);color:#ef4444;padding:10px 14px;border-radius:6px;font-size:14px;z-index:1000;max-width:80%}
</style>
</head>
<body>
<div id="loading">Loading map…</div>
<div id="map"></div>
<div id="fallback">
  <svg id="grid" xmlns="http://www.w3.org/2000/svg"></svg>
  <canvas id="canvas" style="position:absolute;top:0;left:0;cursor:crosshair"></canvas>
  <div class="map-error" id="mapError"></div>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script>
var map, marker, trail, aiTrail, aiMarkers = [], loadingEl, mapEl, fallbackEl, errorEl, msgQueue = [];

function showError(msg) {
  if (!errorEl) return;
  errorEl.textContent = msg;
  errorEl.style.display = 'block';
}

function handleMessage(data) {
  if (data.type === 'pos' && data.lat != null && data.lon != null) setCurrentPos(data.lat, data.lon);
  if (data.type === 'trail') setTrail(data.points);
  if (data.type === 'ai') setAiTrail(data.points);
}

function flushQueue() {
  msgQueue.forEach(handleMessage);
  msgQueue = [];
}

function initMap() {
  mapEl = document.getElementById('map');
  fallbackEl = document.getElementById('fallback');
  loadingEl = document.getElementById('loading');
  errorEl = document.getElementById('mapError');

  if (typeof L === 'undefined') {
    setTimeout(initMap, 500);
    return;
  }

  map = L.map('map').setView([9.082, 8.6753], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '\u00a9 OpenStreetMap'
  }).on('load', function() {
    if (loadingEl) loadingEl.style.display = 'none';
  }).on('tileerror', function() {
    showError('Some tiles failed to load');
  }).addTo(map);

  flushQueue();
}

document.addEventListener('DOMContentLoaded', initMap);
setTimeout(initMap, 100);

function setCurrentPos(lat, lon) {
  if (!map) return;
  if (marker) map.removeLayer(marker);
  marker = L.circleMarker([lat, lon], {
    radius: 7, color: '#059669', fillColor: '#10b981', fillOpacity: 1, weight: 3
  }).addTo(map);
  map.setView([lat, lon], 14);
  if (loadingEl) loadingEl.style.display = 'none';
}

function setTrail(pts) {
  if (!map) return;
  if (trail) map.removeLayer(trail);
  if (!pts || pts.length === 0) return;
  trail = L.polyline(pts, { color: '#10b981', weight: 4, opacity: 0.8 }).addTo(map);
  if (pts.length > 1) {
    map.fitBounds(trail.getBounds(), { padding: [20,20] });
  }
}

function setAiTrail(pts) {
  if (!map) return;
  if (aiTrail) map.removeLayer(aiTrail);
  aiMarkers.forEach(function(m) { map.removeLayer(m); });
  aiMarkers = [];
  if (!pts || pts.length === 0) return;
  aiTrail = L.polyline(pts, { color: '#a855f7', weight: 3, dashArray: '6 4', opacity: 0.7 }).addTo(map);
  pts.forEach(function(p, idx) {
    var m = L.circleMarker(p, { radius: 5, color: '#7e22ce', fillColor: '#a855f7', fillOpacity: 0.85, weight: 2 })
      .bindPopup('AI Pred #' + (idx + 1)).addTo(map);
    aiMarkers.push(m);
  });
}

document.addEventListener('message', function(e) {
  try {
    var data = JSON.parse(e.data);
    if (map) handleMessage(data); else msgQueue.push(data);
  } catch(err) {}
});
window.addEventListener('message', function(e) {
  try {
    var data = JSON.parse(e.data);
    if (map) handleMessage(data); else msgQueue.push(data);
  } catch(err) {}
});
</script>
</body>
</html>`;

export function OSMMapView({ points = [], currentPos, predictedPoints = [], showPredicted = false }: { points?: Point[]; currentPos?: Point | null; predictedPoints?: Point[]; showPredicted?: boolean }) {
  if (!WebView) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e6eef8' }}>
        <Text>Map unavailable (WebView not installed)</Text>
      </View>
    );
  }

  const webviewRef = useRef<any>(null);

  const postMsg = useCallback((data: any) => {
    try {
      webviewRef.current?.postMessage(JSON.stringify(data));
    } catch {}
  }, []);

  useEffect(() => {
    if (currentPos) {
      postMsg({ type: 'pos', lat: currentPos.lat, lon: currentPos.lon });
    }
  }, [currentPos?.lat, currentPos?.lon, postMsg]);

  useEffect(() => {
    if (points.length > 0) {
      postMsg({ type: 'pos', lat: points[points.length - 1].lat, lon: points[points.length - 1].lon });
    }
    postMsg({ type: 'trail', points: points.map((p) => [p.lat, p.lon]) });
  }, [points, postMsg]);

  useEffect(() => {
    if (showPredicted && predictedPoints.length > 0) {
      postMsg({ type: 'ai', points: predictedPoints.map((p) => [p.lat, p.lon]) });
    } else {
      postMsg({ type: 'ai', points: [] });
    }
  }, [predictedPoints, showPredicted, postMsg]);

  return (
    <WebView
      ref={webviewRef}
      originWhitelist={["*"]}
      source={{ html: MAP_HTML }}
      style={{ flex: 1, backgroundColor: '#1a1a2e' }}
      javaScriptEnabled
      domStorageEnabled
      scalesPageToFit={Platform.OS === 'android'}
      mixedContentMode="compatibility"
      allowFileAccess
      cacheEnabled={false}
      setSupportMultipleWindows={false}
    />
  );
}

export default OSMMapView;

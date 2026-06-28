import React from 'react';
import { View, Text, Platform } from 'react-native';
let WebView: any;
try {
  // require at runtime to avoid bundler issues on platforms without the package
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  WebView = require('react-native-webview').WebView;
} catch (e) {
  WebView = null;
}

type Point = { lat: number; lon: number };

export function OSMMapView({ points = [], predictedPoints = [], showPredicted = false }: { points?: Point[]; predictedPoints?: Point[]; showPredicted?: boolean }) {
  if (!WebView) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e6eef8' }}>
        <Text>Map unavailable (WebView not installed)</Text>
      </View>
    );
  }

  const center = points.length > 0 ? [points[0].lat, points[0].lon] : [0, 0];
  const ptsJson = JSON.stringify(points.map((p) => [p.lat, p.lon]));
  const predJson = JSON.stringify(predictedPoints.map((p) => [p.lat, p.lon]));

  const html = `
  <!doctype html>
  <html>
  <head>
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html,body,#map,#fallback{height:100%;margin:0;padding:0}
      #fallback{display:none;background:#f5f5f5;position:relative}
      #grid{position:absolute;top:0;left:0;width:100%;height:100%;stroke:#ddd;stroke-width:1}
      .map-error{display:none;position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.7);color:white;padding:8px;border-radius:4px;font-size:12px;z-index:1000}
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div id="fallback">
      <svg id="grid" xmlns="http://www.w3.org/2000/svg"></svg>
      <canvas id="canvas" style="position:absolute;top:0;left:0;cursor:crosshair"></canvas>
      <div class="map-error" id="mapError">Map offline - grid view</div>
    </div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const gpsPoints = ${ptsJson};
      const aiPoints = ${predJson};
      const center = gpsPoints.length > 0 ? gpsPoints[0] : [0, 0];
      
      let mapLoaded = false;
      
      // Try to load map with timeout
      const mapLoadTimeout = setTimeout(() => {
        if (!mapLoaded) {
          document.getElementById('map').style.display = 'none';
          document.getElementById('fallback').style.display = 'block';
          renderOfflineCanvas();
        }
      }, 3000);
      
      try {
        const map = L.map('map').setView(center, gpsPoints.length > 0 ? 13 : 2);
        
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap',
          errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        });
        
        tileLayer.on('load', () => {
          mapLoaded = true;
          clearTimeout(mapLoadTimeout);
        });
        
        tileLayer.addTo(map);
        
        // GPS points in green
        if (gpsPoints && gpsPoints.length) {
          const poly = L.polyline(gpsPoints, { color: '#10b981', weight: 4, opacity: 0.8 }).addTo(map);
          map.fitBounds(poly.getBounds(), { padding: [20,20] });
          gpsPoints.forEach((p, idx) => {
            L.circleMarker(p, { 
              radius: 5, 
              color: '#059669', 
              fillColor: '#10b981', 
              fillOpacity: 0.9,
              weight: 2
            }).bindPopup('GPS #' + (idx + 1)).addTo(map);
          });
        }
        
        // AI predicted points in purple (if enabled)
        if (aiPoints && aiPoints.length && ${showPredicted ? 'true' : 'false'}) {
          const poly2 = L.polyline(aiPoints, { color: '#a855f7', weight: 3, dashArray: '6 4', opacity: 0.7 }).addTo(map);
          aiPoints.forEach((p, idx) => {
            L.circleMarker(p, { 
              radius: 5, 
              color: '#7e22ce', 
              fillColor: '#a855f7', 
              fillOpacity: 0.85,
              weight: 2
            }).bindPopup('AI Pred #' + (idx + 1)).addTo(map);
          });
        }
      } catch (error) {
        console.log('Map load failed:', error.message);
        document.getElementById('map').style.display = 'none';
        document.getElementById('fallback').style.display = 'block';
        clearTimeout(mapLoadTimeout);
        renderOfflineCanvas();
      }
      
      // Offline canvas renderer
      function renderOfflineCanvas() {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = canvas.offsetWidth || window.innerWidth;
        canvas.height = canvas.offsetHeight || window.innerHeight;
        
        // Draw grid
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        
        // Calculate bounds
        const allPoints = [...gpsPoints, ...aiPoints];
        if (allPoints.length === 0) return;
        
        let minLat = allPoints[0][0], maxLat = allPoints[0][0];
        let minLon = allPoints[0][1], maxLon = allPoints[0][1];
        
        allPoints.forEach(p => {
          minLat = Math.min(minLat, p[0]);
          maxLat = Math.max(maxLat, p[0]);
          minLon = Math.min(minLon, p[1]);
          maxLon = Math.max(maxLon, p[1]);
        });
        
        const latRange = maxLat - minLat || 0.001;
        const lonRange = maxLon - minLon || 0.001;
        const padding = 0.1;
        
        const toCanvasX = (lon) => ((lon - minLon + lonRange * padding) / (lonRange * (1 + 2 * padding))) * canvas.width;
        const toCanvasY = (lat) => ((maxLat + latRange * padding - lat) / (latRange * (1 + 2 * padding))) * canvas.height;
        
        // Draw GPS track in green
        if (gpsPoints.length > 0) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(toCanvasX(gpsPoints[0][1]), toCanvasY(gpsPoints[0][0]));
          for (let i = 1; i < gpsPoints.length; i++) {
            ctx.lineTo(toCanvasX(gpsPoints[i][1]), toCanvasY(gpsPoints[i][0]));
          }
          ctx.stroke();
          
          gpsPoints.forEach((p, i) => {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(toCanvasX(p[1]), toCanvasY(p[0]), 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#059669';
            ctx.lineWidth = 1;
            ctx.stroke();
          });
        }
        
        // Draw AI track in purple (if enabled)
        if (aiPoints.length > 0 && ${showPredicted ? 'true' : 'false'}) {
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(toCanvasX(aiPoints[0][1]), toCanvasY(aiPoints[0][0]));
          for (let i = 1; i < aiPoints.length; i++) {
            ctx.lineTo(toCanvasX(aiPoints[i][1]), toCanvasY(aiPoints[i][0]));
          }
          ctx.stroke();
          ctx.setLineDash([]);
          
          aiPoints.forEach((p, i) => {
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(toCanvasX(p[1]), toCanvasY(p[0]), 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#7e22ce';
            ctx.lineWidth = 1;
            ctx.stroke();
          });
        }
      }
    </script>
  </body>
  </html>
  `;

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html }}
      style={{ flex: 1 }}
      javaScriptEnabled
      domStorageEnabled
      scalesPageToFit={Platform.OS === 'android'}
      mixedContentMode="compatibility"
    />
  );
}

export default OSMMapView;

# TrajectAI — Full Application Documentation

**Application name:** TrajectAI  
**Package / bundle ID:** `com.trajectai.mobile`  
**Version:** 1.0.0 (Android versionCode 2)  
**Platforms:** Android, iOS, Web (Expo)  
**Category:** Location tracking / trajectory prediction / applied machine learning  
**Core idea:** A hybrid GPS + AI trajectory tracking app that records movement and keeps predicting the next position with an on-device LSTM model when GPS becomes weak, stale, or unavailable.

---

## 1. Executive Summary

TrajectAI is a mobile application built with React Native, Expo, and TensorFlow.js that combines Global Positioning System (GPS) tracking with an on-device artificial intelligence model to predict a user's trajectory.

The app records a user's route as a sequence of GPS points, displays the live trail on an OpenStreetMap map, and stores each trip as a session. The distinguishing feature is its **hybrid tracking engine**. While GPS is healthy, the app behaves like a normal tracker. When GPS is lost, degraded, or manually disabled, the engine switches to an LSTM neural network that predicts the next movement in metres (`dx`, `dy`) from the last ten GPS samples. Those predicted points are converted back into latitude/longitude coordinates, drawn on the map as a separate AI trail, and saved alongside the real GPS points.

All AI inference runs locally on the phone. No location data is sent to a backend. Sessions are stored locally in AsyncStorage and can be exported as JSON, CSV, or GPX files through the device's share sheet.

In short:

- **Tracks** real GPS movement with noise filtering and smoothing.
- **Predicts** trajectory with a compact LSTM model when GPS is unreliable.
- **Visualises** GPS and AI paths together on a map.
- **Stores** sessions locally and exports them in three standard formats.
- **Diagnoses** model, GPS, and prediction health in real time.

---

## 2. Problem and Motivation

GPS is not always reliable on mobile devices. Common failure conditions include:

- Tunnels, underpasses, and indoor environments.
- Dense urban areas where buildings reflect satellite signals (urban canyons).
- Weak satellite visibility during the first seconds after the app starts.
- The operating system temporarily suppressing location updates.
- The user disabling location services.
- GPS drift while the device is stationary, which creates phantom movement.

In these situations, conventional GPS trackers either stop recording or produce noisy, misleading paths. TrajectAI addresses this by learning movement patterns from recent GPS history and generating plausible short-term predictions until GPS returns.

A secondary motivation is practical deployment in regions where mobile connectivity and GPS quality can vary. Because the model is small and runs on-device, prediction does not depend on an internet connection or a cloud service. The bundled model is identified in the project as an **LSTM Displacement Predictor trained on Nigerian GPS trajectories**, making the app relevant to local mobility conditions.

---

## 3. What the App Does — Feature Overview

### 3.1 Live GPS tracking

- Requests foreground and background location permission.
- Warms up GPS before tracking so the device has time to acquire a stable fix.
- Records latitude, longitude, speed, heading, accuracy, timestamp, and source.
- Supports start, pause, resume, and stop.
- Computes distance, duration, current speed, and accuracy in real time.

### 3.2 Hybrid GPS + AI tracking

- Monitors GPS quality using reported accuracy.
- Automatically switches to AI prediction after approximately five seconds of GPS loss.
- Generates a predicted point every two seconds while prediction mode is active.
- Requires at least ten GPS points before prediction begins.
- Prevents AI-to-AI feedback loops by training/predicting only from GPS-sourced points.
- Automatically returns to GPS-only mode when a good GPS signal is restored.
- Includes a manual "GPS / AI ON" toggle for demonstrating AI mode without physically losing GPS.

### 3.3 AI trajectory prediction

- Runs a compact LSTM model directly in the app through TensorFlow.js.
- Uses a sliding window of the last ten GPS readings.
- Input features: latitude, longitude, speed, heading.
- Output: displacement in metres, `dx` and `dy`.
- Converts displacement to the next latitude/longitude.
- Estimates a confidence score for every prediction.
- Disposes tensors after each inference to protect mobile memory.

### 3.4 Map visualisation

- Displays an OpenStreetMap map inside a WebView using Leaflet.
- Current position marker.
- Green solid polyline for the GPS trail.
- Purple dashed polyline and markers for predicted points.
- Floating overlay showing GPS signal quality, tracking mode, point counts, and accuracy.

### 3.5 Session management

- Creates named tracking sessions.
- Lists all sessions with distance, duration, and point count.
- Opens a session detail view with map, key statistics, and export actions.
- Deletes sessions with confirmation.
- Persists sessions locally across app restarts.

### 3.6 Data export

- Exports a session as **JSON** with metadata, statistics, and full point data.
- Exports a session as **CSV** for spreadsheet analysis.
- Exports a session as **GPX** for use in GIS and mapping tools.
- Uses the native share sheet to send or save the file.

### 3.7 Diagnostics

- Dedicated diagnostics modal showing:
  - TensorFlow backend status.
  - AI model loading status.
  - GPS status.
  - Last inference time.
  - Total inferences and prediction errors.
  - Last predicted coordinates.
  - Number of buffered GPS points.
- In-tracker expandable "AI Diagnostics" panel with model status, prediction counts, confidence, last `dx`/`dy`, and human-readable status messages.

### 3.8 Theming and usability

- Light and dark mode, persisted across launches.
- Tab navigation: Sessions, Tracker, Settings.
- Animated recording indicator.
- Clear empty states and error messages.
- Permission and GPS-disabled recovery prompts.

---

## 4. Target Users and Use Cases

**Primary users**

- Researchers and students evaluating GPS/AI trajectory prediction.
- Field workers and delivery riders operating in areas with intermittent GPS.
- Outdoor users who want a record of movement with graceful degradation.
- Developers who need a reference implementation of on-device TensorFlow.js in Expo.

**Representative use cases**

1. Recording a walk, drive, or ride and reviewing the route later.
2. Demonstrating how an LSTM predicts movement after GPS loss.
3. Collecting labelled GPS + AI trajectory data for research.
4. Exporting trajectories into GIS software through GPX.
5. Comparing GPS-only and hybrid trajectories for a report or evaluation.

---

## 5. System Architecture

### 5.1 High-level architecture

The app is organised into four layers:

| Layer | Responsibility | Main files |
|---|---|---|
| Presentation | Screens, navigation, visual components | `src/app/`, `src/components/`, `components/` |
| Application logic | Tracking hooks, hybrid state machine, sessions | `lib/hooks/`, `lib/store/` |
| Domain services | AI inference, model loading, export, diagnostics | `lib/services/`, `src/lib/` |
| Platform / storage | Expo modules, AsyncStorage, file system | `expo-*`, `@react-native-async-storage` |

The active runtime path is:

```
Expo Router (src/app)
        │
        ├── Sessions tab ──► sessionContext ──► AsyncStorage
        ├── Tracker tab ───► useLocationTracking ──► expo-location
        │                        │
        │                        ├──► GPS filtering pipeline
        │                        └──► useHybridTracking
        │                                  │
        │                                  ├──► predictionService
        │                                  │        │
        │                                  │        └──► modelService ──► TF.js + bundled LSTM
        │                                  │
        │                                  └──► diagnosticsService ──► DiagnosticsContext
        │
        ├── Session detail ──► exportService ──► FileSystem + Sharing
        └── Settings / Diagnostics
```

### 5.2 Runtime data flow

1. `useLocationTracking` subscribes to `expo-location` using `watchPositionAsync`.
2. Raw positions pass through accuracy, warm-up, smoothing, stationary, spike, and movement gates.
3. Accepted points are added to the GPS point array and written to AsyncStorage.
4. The same points are passed as a prop into `useHybridTracking`.
5. `useHybridTracking` monitors GPS freshness and signal quality.
6. If GPS is lost beyond the threshold, it starts a two-second prediction interval.
7. `predictionService` takes the last ten GPS-only points, normalises them, and calls the model.
8. The model returns `dx`, `dy`; the app converts them to a predicted coordinate.
9. Predicted points are appended to the AI trail, rendered in purple, and counted.
10. When GPS recovers, the interval stops and the mode returns to GPS-only.
11. On stop, AI points and diagnostics are merged into the saved session.

### 5.3 Navigation structure

```
Root Stack (src/app/_layout.tsx)
├── (tabs)
│   ├── index      → Sessions list
│   ├── tracker    → Live map + tracking controls
│   └── settings   → Preferences, diagnostics entry, app info
├── session-detail → Modal: map, stats, export
└── diagnostics    → Modal: AI/GPS health
```

Providers wrap the entire app:

- `ThemeProvider` — light/dark mode.
- `SessionProvider` — session CRUD and persistence.
- `SensorFusionProvider` — placeholder for future sensor fusion.
- `DiagnosticsProvider` — live AI diagnostics state.
- `ErrorBoundary` — catches render-time failures and shows a fallback screen.

### 5.4 Module map

| Module | Purpose |
|---|---|
| `lib/hooks/useLocationTracking.js` | GPS subscription, filtering, distance, duration, permissions |
| `lib/hooks/useHybridTracking.js` | Mode state machine, GPS-loss detection, prediction scheduling |
| `lib/hooks/useAsyncStorage.js` | Low-level session persistence |
| `lib/services/predictionService.js` | Input preparation, TF.js inference, confidence calculation |
| `lib/services/modelService.js` | Loads `model.json` + weight shard into TensorFlow.js |
| `lib/services/sensorService.js` | Accelerometer/gyroscope/magnetometer scaffold (not active) |
| `lib/services/exportService.js` | JSON, CSV, GPX serialisation |
| `lib/services/diagnosticsService.js` | Observable diagnostics store |
| `lib/store/sessionContext.js` | Session CRUD context |
| `lib/store/themeContext.js` | Theme preference persistence |
| `lib/store/diagnosticsContext.js` | Diagnostics React context |
| `lib/utils/constants.js` | Central configuration for GPS, AI, map, storage, UI |
| `lib/utils/calculations.js` | Haversine, heading, displacement conversion, statistics |
| `lib/utils/scaler.js` | Feature normalisation for the model |
| `src/app/(tabs)/tracker.js` | Main tracking screen |
| `src/app/session-detail.tsx` | Session detail and export screen |
| `src/components/OSMMapView.tsx` | Leaflet map embedded in a WebView |

Note: the repository also contains an older parallel implementation under `src/hooks/` and `src/lib/`. The screens in use import from `lib/`, so that is the authoritative runtime path. The `src/hooks/useHybridTracking.ts` and `src/lib/*` files are best treated as legacy/reference code.

---

## 6. Technology Stack

### 6.1 Core

| Technology | Version / role |
|---|---|
| React Native | 0.85 |
| React | 19 |
| Expo SDK | 56 |
| Expo Router | File-based navigation and modals |
| TypeScript | 6, strict mode (with some JavaScript modules) |
| TensorFlow.js | 4.22 |
| `@tensorflow/tfjs-react-native` | Native TensorFlow backend |
| AsyncStorage | Local session and theme persistence |
| expo-location | GPS and permission APIs |
| react-native-webview | Hosts the Leaflet map |
| Leaflet 1.9.4 + OpenStreetMap | Map rendering and tiles |
| expo-file-system | Writes export files |
| expo-sharing | Native share sheet |
| expo-asset | Resolves the bundled model weight file |
| expo-constants | App version/build information |

### 6.2 Supporting libraries

- `@expo/vector-icons` / Ionicons — iconography.
- `expo-haptics`, `expo-sensors`, `expo-camera`, `expo-image`, `expo-gl`, `react-native-maps`, `react-native-chart-kit`, `lottie-react-native`, and several others are installed. Not all are wired into the current screens; some are reserved for planned features.

### 6.3 Build and tooling

- EAS Build profiles: `development`, `preview` (APK), `production`.
- `metro.config.js` adds `bin` to asset extensions so the model weight shard can be bundled.
- Android permissions declared: fine location, coarse location, background location, body sensors, internet, network state.
- iOS permissions declared: location when in use, always-and-when-in-use, motion, background location mode.

---

## 7. User Experience and Screens

### 7.1 Sessions tab

The home screen lists saved sessions. Each card shows:

- Session name.
- Creation date/time.
- Total distance.
- Duration.
- Number of points.

Actions:

- Pull to refresh.
- Tap a session to open details.
- Delete with confirmation.
- Create a new session.
- Empty state encourages the first session.

### 7.2 Tracker tab

The main operating screen, split into a map and a statistics panel.

**Map area**

- Live GPS trail.
- Current position marker.
- AI-predicted trail when available.
- Floating status card: signal quality, mode badge, GPS/AI point counts, accuracy.

**Statistics panel**

- Large current speed readout in metres per second.
- Distance and duration.
- Expandable details: accuracy, GPS points, AI points, average confidence, active mode.
- Expandable AI diagnostics: model state, hybrid GPS count, AI point count, prediction status, last prediction displacement and confidence.
- GPS unavailable prompt with links to system location settings and retry.

**Bottom controls**

- Start.
- While recording: Pause, GPS/AI toggle, Stop.
- While paused: Resume, Stop.
- The AI toggle is locked until ten GPS points exist, with an explanatory alert.

### 7.3 Session detail

- Back navigation.
- Session name and date.
- Hero map showing GPS and AI paths.
- KPI grid: distance, duration, average speed, GPS points, AI points (when present).
- Export actions: JSON, CSV, GPX.
- Details: total points, average accuracy, average AI confidence.
- A "Speed / Accuracy Timeline" card exists as a visual placeholder; the chart is not yet implemented.

### 7.4 Settings

- Dark mode switch, persisted.
- GPS accuracy information (high accuracy).
- Background tracking switch (currently UI-only).
- Update interval information (1 second).
- AI mode information.
- Hybrid threshold information (5 seconds).
- Debug mode switch (UI-only).
- AI Diagnostics entry.
- Export all sessions (placeholder).
- Clear all data (placeholder confirmation).
- About and version/build information.
- Documentation and issue-reporting placeholders.

### 7.5 Diagnostics modal

- TensorFlow status and error.
- Model status and error.
- GPS status.
- Prediction metrics: last inference time, total inferences, errors.
- Last predicted latitude/longitude.
- Buffered GPS point count.

---

## 8. GPS Tracking Subsystem

The GPS pipeline is deliberately conservative. Raw GPS is noisy, especially when the device is stationary, so the app applies multiple filters before saving a point.

### 8.1 Configuration

| Parameter | Value | Meaning |
|---|---|---|
| Minimum save interval | 3000 ms | Prevents excessive points |
| Maximum acceptable accuracy | 20 m | Worse fixes are discarded |
| Minimum speed | 0.5 m/s | Below this the device is considered stationary |
| Small step threshold | 8 m | Minimum movement from last saved point |
| Maximum step distance | 500 m | Rejects impossible teleportation |
| Smoothing buffer | 5 readings | Averages raw coordinates |
| Good accuracy | ≤ 20 m | Good signal |
| Weak accuracy | ≤ 50 m | Weak signal |
| Poor accuracy | ≤ 100 m | Poor signal |
| Stationary radius | 30 m | Spread across the window |
| Stationary window | 8 smoothed positions | Confirms genuine stationary state |
| Warm-up period | 15 s | Ignores movement saves while GPS converges |
| Heartbeat interval | 30 s | Sparse anchor points during long pauses |

### 8.2 Processing gates

For every raw position:

1. **Accuracy gate** — reject fixes with null or worse-than-20 m accuracy.
2. **Warm-up gate** — suppress movement saves during the first 15 seconds.
3. **Smoothing** — average the last five raw readings into a centroid.
4. **Stationary detection** — if the last eight smoothed positions stay within 30 m of the oldest, treat the device as stationary.
5. **Doppler speed check** — if the device reports speed, trust it: below 0.5 m/s means stationary.
6. **Stationary window fill** — do not save movement until enough history exists, except for the first anchor point.
7. **Spike filter** — reject jumps greater than 500 m.
8. **Movement threshold** — require at least 8 m from the last saved point and at least 3 seconds since the last save.
9. **Heartbeat** — while stationary, optionally save one point every 30 seconds, and only if the position has drifted beyond the stationary radius.

Accepted points carry:

```json
{
  "lat": 6.52,
  "lon": 3.39,
  "timestamp": "2026-10-22T12:00:00.000Z",
  "speed": 1.4,
  "heading": 87.3,
  "mode": "gps_only",
  "source": "gps",
  "accuracy": 8.2,
  "isHeartbeat": false,
  "recordedMode": "GPS_ONLY"
}
```

### 8.3 Distance and statistics

Distance between consecutive accepted points is computed with the Haversine formula:

```
d = 2R · atan2(√a, √(1 − a))
a = sin²(Δφ/2) + cos φ₁ · cos φ₂ · sin²(Δλ/2)
R = 6,371,000 m
```

Distance is only accumulated when the reported speed indicates real movement and the step is under 20 m in the statistics layer. Session statistics include total distance, average speed, maximum speed, duration, average accuracy, and average AI confidence.

### 8.4 Heading and displacement

Heading is calculated from the bearing between the last saved point and the new smoothed point. Predicted displacement is converted back to coordinates using:

```
dLat = dy / R
dLon = dx / (R · cos(lat))
newLat = lat + dLat · 180/π
newLon = lon + dLon · 180/π
```

This treats `dx` as east-west metres and `dy` as north-south metres, which is adequate for the short distances involved in trajectory prediction.

---

## 9. Hybrid GPS + AI Engine

The hybrid engine is a state machine implemented in `lib/hooks/useHybridTracking.js`.

### 9.1 Modes

| Mode | Behaviour |
|---|---|
| `gps_only` | GPS drives the trail; no predictions scheduled |
| `hybrid` | GPS is primary, AI predictions are generated when GPS is unreliable |
| `ai_only` | AI prediction is the intended primary source |

### 9.2 Signal quality

Signal quality is derived from the latest GPS accuracy:

- `good`: accuracy ≤ 20 m.
- `weak`: accuracy ≤ 50 m.
- `poor`: accuracy ≤ 100 m.
- `lost`: accuracy missing or > 100 m, or GPS manually disabled.

### 9.3 Switching logic

1. The user starts tracking. The app creates a session and begins GPS recording.
2. Every accepted GPS point refreshes a "last GPS time" heartbeat.
3. If no GPS point arrives for five seconds, `gpsLossStart` is set. A dedicated freshness monitor catches silent OS-level loss.
4. Once the loss exceeds five seconds, the mode switches to `hybrid`, and a prediction interval starts.
5. Predictions run every two seconds, provided at least ten GPS points exist.
6. Each prediction appends an AI point with source `ai`, confidence, `dx`, and `dy`.
7. When a good GPS point returns and `gpsLossStart` is cleared, the mode switches back to `gps_only` and the interval stops.

### 9.4 Manual AI demonstration mode

The GPS/AI toggle in the tracker is intended for demonstrations and testing. When the user turns "GPS" off:

- The engine forces `gpsSignal = lost` and `gpsLossStart = now`.
- It immediately starts the prediction interval.
- It fires one prediction right away.
- It keeps predicting even though the phone is still receiving GPS.
- Turning the toggle back on clears the forced loss and resumes normal monitoring.

The toggle is disabled until ten GPS points have been collected, because the model needs a full sequence.

### 9.5 Anti-feedback protection

AI predictions must not become the model's next input, or errors would compound. `predictionService` filters to points whose `source` is `gps` (or has no source) and takes only the last ten of those. Predicted points are stored separately and merged into the exported session only at stop time.

### 9.6 Buffer limits

- The hybrid hook keeps the most recent 100 GPS points in memory.
- The session itself retains all points.
- The model always consumes the last 10 GPS points.

### 9.7 Mode-switch telemetry

The engine records switch events with timestamps and from/to modes, plus the last switch time. At stop time it saves an `aiDiagnostics` object containing:

- Model status.
- Last prediction.
- Mode at stop.
- Prediction count.
- Average confidence.
- Switch events.
- GPS and AI point counts at stop.

This makes hybrid behaviour auditable in exported data.

---

## 10. AI Model

### 10.1 Model specification

| Property | Value |
|---|---|
| Type | Sequential LSTM regressor |
| Framework | Keras 3.6.0, converted with TensorFlow.js Converter 3.18.0 |
| Input shape | `[batch, 10, 4]` |
| Input features | Latitude, longitude, speed, heading |
| Sequence length | 10 |
| Output | `[dx, dy]` displacement in metres |
| Total parameters | 30,642 |
| Weight file | `group1-shard1of1.bin` (122,568 bytes) |
| Training domain | Nigerian GPS trajectories |
| Reported mean error | 1.1 m |
| Reported median error | 0.6 m |
| Reported best error | 0.0 m |
| Reported worst error | 10.3 m |

The stated errors come from `assets/model/model_info.json` and should be presented as the model's reported evaluation figures, not as independently reproduced results.

### 10.2 Architecture

```
Input: (10 timesteps × 4 features)
  ↓
LSTM(64 units, tanh) → returns sequences
  ↓
Dropout(0.2)
  ↓
LSTM(32 units, tanh)
  ↓
Dropout(0.2)
  ↓
Dense(16, ReLU)
  ↓
Dense(2, linear)  →  [dx, dy] in metres
```

Two stacked LSTM layers learn short-term motion patterns. Dropout reduces overfitting. The dense head maps the learned representation to a two-dimensional displacement.

### 10.3 Feature normalisation

The model expects features scaled to a comparable range. Normalisation uses min-max scaling with clipping:

```
x_norm = (x − min) / (max − min)
x_norm = clamp(x_norm, 0, 1)
```

Two scaler definitions exist in the repository:

**Model reference scaler — `assets/model/scaler.json`**

```json
{
  "data_min": [5.3720293, 6.9976181, 0.0, 0.0],
  "data_max": [5.3791277, 7.0027822, 3.68, 355.6],
  "feature_names": ["latitude", "longitude", "speed", "heading"]
}
```

**Runtime scaler — `lib/utils/constants.js` (`MODEL_CONFIG.SCALER`)**

```json
{
  "data_min": [6.510, 3.390, 0.0, 0.0],
  "data_max": [6.530, 3.410, 3.68, 355.6],
  "feature_names": ["latitude", "longitude", "speed", "heading"]
}
```

The active inference path (`lib/services/predictionService.js` → `lib/utils/scaler.js`) reads the runtime scaler from `MODEL_CONFIG`, not the JSON file in `assets/model/`. The two ranges cover different Nigerian regions (the asset scaler around the Port Harcourt/Niger Delta area, the runtime scaler around Lagos). Because out-of-range values are clipped to 0 or 1, using the wrong scaler does not crash the model; instead it compresses coordinates into a constant region and degrades prediction quality.

The model performs best when the device is operating inside the runtime scaler's range (approximately 6.510–6.530 latitude, 3.390–3.410 longitude). For deployment elsewhere, the scaler must be regenerated from the model's training data and kept in sync with the model version. This mismatch is one of the most important technical limitations to note in a report.

### 10.4 Inference pipeline

`predictNextLocation(points)`:

1. Require at least ten points.
2. Keep only GPS-sourced points and take the last ten.
3. Normalise each point to four features.
4. Build a tensor of shape `[1, 10, 4]`.
5. Run `model.predict`.
6. Read `dx` and `dy` from the output.
7. Compute confidence.
8. Dispose the input and output tensors.
9. Return `{ dx, dy, confidence }`.

Confidence is a heuristic, not a calibrated probability. The active service uses:

```
displacement = √(dx² + dy²)
confidence = clamp(1 − displacement / 50, 0, 1)
```

The intuition is that large predicted jumps are less trustworthy for short-term prediction, while small, stable displacements are more plausible. This means a near-zero displacement produces a confidence close to 1.0, even if the model is simply predicting "stay still". The value is useful as a relative indicator in the UI, but it is not a statistically calibrated probability and should not be described as one in a report.

The older, unused `src/lib/predictor.ts` contains a stricter variant (`1 − displacement / 100`, capped at 0.95, with a 2 m noise floor), and `HYBRID_CONFIG.MIN_MEANINGFUL_DISPLACEMENT_M` is defined but not applied by the active service. These inconsistencies are another reason to consolidate the two implementations.

### 10.5 Model loading on mobile

Model loading is a notable engineering challenge in React Native. The implementation:

1. Ensures the TensorFlow.js backend is ready.
2. Resolves the weights shard through `expo-asset`.
3. Downloads the asset to a local URI.
4. Reads the file as an `ArrayBuffer` through `expo-file-system`'s `File` API.
5. Builds a TensorFlow.js memory artifact from `modelTopology`, `weightSpecs`, and `weightData`.
6. Calls `tf.loadLayersModel(tf.io.fromMemory(...))`.
7. Applies a 30-second timeout.
8. Caches the loaded model and reports status to diagnostics.

The model JSON is imported at build time, while the weight shard is bundled as an asset. `metro.config.js` registers `bin` as an asset extension, which is required for the shard to be packaged.

### 10.6 Inference cost

The model has roughly 30k parameters and a small input, so inference is lightweight enough for mobile CPUs. The app schedules predictions every two seconds rather than every GPS tick, and disposes tensors after each run. This keeps CPU, memory, and battery overhead bounded.

---

## 11. Sessions, Storage, and Export

### 11.1 Session model

```json
{
  "sessionId": "naija_1760000000000_ab12cde",
  "sessionName": "Track 14:32:10",
  "mode": "hybrid",
  "createdAt": "2026-10-22T13:32:10.000Z",
  "startedAt": null,
  "stoppedAt": null,
  "points": [],
  "aiDiagnostics": {
    "modelStatus": "loaded",
    "lastPrediction": { "dx": 1.2, "dy": 0.8, "confidence": 0.87 },
    "modeAtStop": "hybrid",
    "predictionCount": 42,
    "avgConfidence": 0.81,
    "switchEvents": [],
    "gpsPointsAtStop": 63,
    "aiPointsAtStop": 42
  }
}
```

Each point is tagged with its source (`gps` or `ai`), and AI points also carry `confidence`, `dx`, `dy`, and `predicted: true`. `recordedMode` records whether the point was produced in `GPS_ONLY`, `HYBRID`, or `AI_ONLY` mode.

### 11.2 Storage

- Storage engine: `@react-native-async-storage/async-storage`.
- Sessions key: `naija-gps-sessions`.
- Theme key: `naija-gps-theme`.
- Preferences key: `naija-gps-preferences` (reserved).
- Onboarding key: `naija-gps-onboarding-completed` (reserved).
- Maximum sessions constant: 100 (defined; enforcement is not yet implemented).
- Data is local to the device; there is no account, cloud sync, or remote database.

### 11.3 Export formats

**JSON** includes session metadata, statistics, normalised points, and AI diagnostics. It is the most complete format and is the one used by the "Share" button in the session header.

**CSV** columns:

```
lat,lon,timestamp,speed,heading,source,confidence,accuracy,recordedMode[,dx,dy]
```

The `dx` and `dy` columns appear only when the session contains AI points.

**GPX** produces a standard `<gpx>` document with a track segment. Each point becomes a `<trkpt>` with elevation set to zero, time, speed, heading, source, recorded mode, confidence, accuracy, and displacement extensions. This makes the output usable in GIS and fitness tools.

Files are written to the app's document directory and passed to `expo-sharing`. If sharing is unavailable, the file path is shown to the user.

### 11.4 Statistics

Session statistics are recalculated from points whenever a session is displayed or exported. They include distance, average speed, maximum speed, duration, average accuracy, and average AI confidence. This keeps stored data minimal and lets the app derive metrics consistently.

---

## 12. Mapping

The map is implemented in `src/components/OSMMapView.tsx`. Rather than using a native map SDK, the app embeds a small HTML document in a `react-native-webview`.

- Leaflet 1.9.4 is loaded from a CDN.
- OpenStreetMap tiles are loaded from `tile.openstreetmap.org`.
- GPS points are drawn as a solid green polyline.
- AI points are drawn as a purple dashed polyline with circular markers.
- The map re-renders when new points arrive.
- The current position is shown as a circle marker.
- The map fits the GPS trail bounds when the trail has more than one point.
- React Native communicates with the WebView by posting JSON messages (`pos`, `trail`, `ai`).

The trade-off is that map rendering depends on network access for the Leaflet library and tiles. The component includes fallback markup, but the current initialisation path primarily retries until Leaflet is available. For a fully offline product, Leaflet and tiles would need to be bundled locally.

---

## 13. Diagnostics and Observability

The app includes a purpose-built diagnostics layer, which is valuable for a research or demonstration project.

`diagnosticsService.js` is a small observable store. It tracks:

- TensorFlow status: not-initialized, initializing, ready, failed.
- TensorFlow error message.
- Model status: not-loaded, loading, loaded, failed.
- Model error message.
- GPS status: inactive or active.
- Last inference duration in milliseconds.
- Last predicted coordinates.
- Buffered GPS point count.
- Total inference count.
- Total prediction error count.

Components subscribe through `DiagnosticsProvider`, which turns the service into React state. This allows the diagnostics modal to update live without coupling the AI layer to the UI.

The tracker screen also exposes a compact in-context diagnostics panel. It shows model status, GPS/AI counts, whether prediction is active, the last `dx`/`dy` and confidence, and a human-readable message such as:

- "Waiting for 3 more GPS points."
- "Model ready."
- "Predicted: 2.1m 84% confidence."
- "Model failed to load."

This makes failures visible during field testing instead of silently producing an empty AI trail.

---

## 14. Privacy and Security

**Privacy strengths**

- AI inference is fully on-device.
- Location history is stored only in local AsyncStorage.
- No backend, account system, or analytics pipeline is configured.
- Export is user-initiated through the native share sheet.
- The `.env.example` API settings are placeholders and are not used by the current runtime.

**Privacy considerations**

- Map tiles and the Leaflet library are fetched from third-party CDNs, which necessarily reveals network metadata and the approximate map area being viewed.
- Exported JSON/CSV/GPX files contain precise location history and should be handled as personal data.
- AsyncStorage is not encrypted by default. A production version handling sensitive movement data should consider encrypted storage or secure enclave-backed keys.
- There is no authentication, so anyone with device access can view sessions.
- Background location permission is declared, although background tracking is not fully wired in the current build.

**Security hygiene**

- No secrets or API keys are committed in the active code path.
- TensorFlow tensors are disposed after inference.
- The WebView is restricted to its own content but loads remote scripts and tiles; a production hardening pass should pin or bundle those dependencies.

---

## 15. Performance and Reliability

Several design choices keep the app usable on mobile hardware:

- **Sliding window**: only ten points are fed to the model.
- **Bounded memory**: the hybrid hook keeps 100 GPS points; the session keeps all points on disk.
- **Throttled inference**: one prediction every two seconds, not on every GPS callback.
- **Tensor disposal**: prevents GPU/CPU memory leaks across repeated inference.
- **Single model instance**: the model is cached and reused.
- **Load timeout**: 30 seconds prevents an indefinite hang.
- **Failure back-off**: after a model load failure, the engine stops retrying for the session instead of spamming errors.
- **GPS filtering**: reduces storage writes and prevents phantom distance.
- **Local storage**: no network round trip for core functionality.
- **Error boundary**: prevents a render error from producing a blank screen.

Reliability caveats:

- The WebView map requires network access for CDN assets and tiles.
- The app relies on device GPS accuracy reporting, which varies by hardware.
- The model's geographic applicability is limited by its training scaler.
- Predictions are short-term and should not be treated as navigation-grade.

---

## 16. Key Engineering Challenges and How They Were Solved

### 16.1 GPS noise while stationary

**Problem:** A stationary phone can report positions drifting 10–30 m, creating fake movement and inflating distance.

**Solution:** A multi-gate pipeline combining accuracy rejection, five-reading smoothing, an eight-position stationary window, Doppler speed checks, an 8 m movement threshold, and a 500 m spike filter. Heartbeats are only saved when the device has genuinely drifted beyond the stationary radius.

### 16.2 Silent GPS loss

**Problem:** When location is disabled at the OS level, `watchPositionAsync` may simply stop delivering callbacks without throwing an error.

**Solution:** A dedicated freshness monitor runs every second while tracking. If no point has arrived for five seconds, it sets `gpsLossStart`, which triggers the same AI fallback path used for poor accuracy.

### 16.3 Premature predictions

**Problem:** An LSTM needs a full sequence; predicting with fewer than ten points produces meaningless output.

**Solution:** The engine enforces a ten-point minimum, shows a "waiting for N more points" message, disables the manual AI toggle until the threshold is met, and throttles log warnings.

### 16.4 AI feedback loops

**Problem:** If predicted points are fed back into the model, errors compound and the trajectory drifts.

**Solution:** `predictionService` filters to GPS-sourced points only and always takes the last ten real GPS points. AI points are stored separately and merged only for export.

### 16.5 Loading a Keras model in React Native

**Problem:** Mobile bundlers do not handle TensorFlow.js model files like a web server does.

**Solution:** The weights shard is bundled as a Metro asset, resolved with `expo-asset`, read as an `ArrayBuffer` using `expo-file-system`, and loaded through `tf.io.fromMemory`. The model topology is imported directly from JSON.

### 16.6 Stale React state in timers

**Problem:** Interval callbacks can capture old state, causing predictions to use outdated point arrays.

**Solution:** The hook stores the latest state in a ref (`stateRef`) and the latest prediction function in another ref (`runPredictionRef`), so intervals always call current logic.

### 16.7 Mode hysteresis

**Problem:** Flickering GPS quality could cause rapid mode switching.

**Solution:** A five-second loss threshold, a recovery rule that requires a good signal and cleared loss state, and switch-event telemetry. The manual toggle intentionally bypasses the threshold for demonstration.

### 16.8 Model/scaler mismatch

**Problem:** Normalising coordinates outside the scaler's range pushes inputs outside the training distribution. In this codebase the model reference scaler (`assets/model/scaler.json`) and the runtime scaler (`MODEL_CONFIG.SCALER` in `lib/utils/constants.js`) describe different coordinate ranges. The runtime scaler is the one actually used, and clipping hides the mismatch rather than reporting it.

**Solution / mitigation:** The runtime scaler is explicitly defined in one configuration file, documented as needing to match the device's operating region, and the normaliser clips values to `[0, 1]` to avoid LSTM saturation. The correct production fix is to generate the scaler automatically from the training pipeline, ship it with the model, load it at runtime, and warn when incoming coordinates fall outside the training envelope. This remains an open item and is a good example of the practical gap between a model in a notebook and a deployed model.

---

## 17. Current Limitations and Future Work

### 17.1 Limitations

1. **No backend or cloud sync.** Sessions exist only on the device.
2. **Model domain is narrow.** The bundled scaler and training data cover a limited geographic area.
3. **Confidence is heuristic.** It is derived from displacement magnitude, not from a calibrated probabilistic output.
4. **Map requires connectivity.** Leaflet and tiles load from CDNs.
5. **Sensor fusion is scaffolded, not active.** `sensorService` and `SensorFusionContext` exist, but initialisation is commented out and no sensor data influences tracking.
6. **Some settings are UI-only.** Background tracking, debug mode, export-all, clear-all, documentation, and issue reporting are placeholders.
7. **Timeline chart is a placeholder.** The session detail screen reserves a card but does not render a chart.
8. **Legacy duplicate code.** `src/hooks/` and `src/lib/` contain an older implementation that is not used by the active screens. This can confuse maintenance and should be consolidated.
9. **No automated tests.** There is no unit, integration, or end-to-end test suite in the repository.
10. **No encryption at rest.** AsyncStorage data is not encrypted.
11. **Model evaluation is not reproduced in-app.** Reported error metrics come from the model metadata, not from an in-app benchmark harness.
12. **Background tracking is not fully implemented.** Permissions are declared, but the recording lifecycle is foreground-oriented.

### 17.2 Recommended future work

- Add a backend sync layer with authentication and encrypted transport.
- Bundle map assets for offline use.
- Activate sensor fusion (accelerometer, gyroscope, magnetometer) to improve dead reckoning.
- Train and version the model with an explicit scaler manifest, and support multiple regional models.
- Calibrate confidence using validation residuals instead of a displacement heuristic.
- Add automated tests for filtering, mode switching, prediction shape, and export serialisation.
- Add an in-app evaluation screen that compares predicted points with later GPS points and reports error.
- Implement background tracking with `expo-task-manager` and `expo-location` background tasks.
- Add session renaming, search, filtering, and bulk export.
- Encrypt local storage and add a privacy dashboard.
- Consolidate the duplicate `src/` and `lib/` implementations.

---

## 18. Running and Building the App

### 18.1 Prerequisites

- Node.js 16 or newer.
- npm.
- Expo CLI / EAS CLI.
- Android Studio or Xcode for native builds.
- A physical device is strongly recommended for GPS and TensorFlow testing.

### 18.2 Development

```bash
npm install
npx expo start
```

Other scripts:

```bash
npm run android      # expo run:android
npm run ios          # expo run:ios
npm run web          # expo start --web
npm run lint         # expo lint
npm run build        # eas build
npm run build:android
npm run build:ios
```

### 18.3 EAS build profiles

| Profile | Purpose |
|---|---|
| `development` | Development client, internal distribution |
| `preview` | Internal distribution, Android APK |
| `production` | Store build, auto-increment version |

### 18.4 Environment

`.env.example` documents optional settings:

```
REACT_APP_API_URL
REACT_APP_API_TIMEOUT
REACT_APP_MODEL_PATH
REACT_APP_ENABLE_DEBUG_MODE
REACT_APP_ENABLE_SENSOR_FUSION
REACT_APP_ENABLE_BACKGROUND_TRACKING
REACT_APP_ANALYTICS_ENABLED
REACT_APP_VERSION
```

These are placeholders for future backend and feature-flag integration; the current runtime does not read them.

### 18.5 Important build notes

- `metro.config.js` must keep `bin` in `assetExts` for the model shard.
- The model files must remain at `assets/model/model.json` and `assets/model/group1-shard1of1.bin`.
- Android needs location permissions in `app.json`.
- iOS needs the location and motion usage descriptions plus the background location mode.
- TensorFlow.js in Expo can require a development build rather than Expo Go, depending on the native backend.

---

## 19. How the App Was Achieved — Implementation Summary

The project was delivered by combining four independent technical threads into one mobile application.

**1. Reliable GPS acquisition.**  
The team used `expo-location` for cross-platform positioning, then built a filtering pipeline around it. Instead of trusting every fix, the app rejects inaccurate readings, smooths coordinates, detects stationary periods, filters spikes, and enforces time and distance thresholds. This turned noisy raw GPS into a stable trail suitable for both display and machine learning.

**2. A hybrid mode state machine.**  
The core innovation is not just running a model, but knowing when to run it. The team implemented explicit modes, a five-second GPS-loss threshold, a freshness monitor for silent loss, a two-second prediction cadence, automatic recovery, and a manual override for demonstrations. The state machine records its transitions so hybrid behaviour can be inspected later.

**3. On-device LSTM inference.**  
A small Keras LSTM was trained to map ten GPS samples to a displacement vector, then converted to TensorFlow.js. The mobile team solved asset bundling, model loading, feature normalisation, tensor lifecycle management, and confidence estimation. The result is a model small enough to run on a phone and fast enough to predict every two seconds.

**4. Local-first data and observability.**  
Sessions, points, AI diagnostics, and theme preferences are persisted with AsyncStorage. A dedicated diagnostics service surfaces model, GPS, and inference health in real time. Exports to JSON, CSV, and GPX make the collected data usable outside the app. The Leaflet/WebView map gives both GPS and AI trails a clear visual representation.

Together these threads produce an app that does something more useful than plain tracking: it degrades gracefully when GPS fails, makes its predictions visible and measurable, and preserves the evidence needed to evaluate them.

---

## 20. Report-Ready Highlights

Use these points directly in a report or presentation:

- **Purpose:** Hybrid GPS + AI trajectory tracking for environments with unreliable GPS.
- **AI:** On-device LSTM with 30,642 parameters, 10×4 input, two LSTM layers (64 and 32 units), dropout, and a two-output displacement head.
- **Reported accuracy:** 1.1 m mean error, 0.6 m median error, 10.3 m worst case, per model metadata.
- **Prediction cadence:** every 2 seconds, from the last 10 GPS points.
- **GPS fallback threshold:** 5 seconds of loss.
- **Minimum history:** 10 GPS points.
- **Data handling:** fully local, AsyncStorage, no backend.
- **Visualisation:** Leaflet + OpenStreetMap, green GPS trail, purple dashed AI trail.
- **Export:** JSON, CSV, GPX via native share sheet.
- **Observability:** live TF/model/GPS/prediction diagnostics.
- **Platform:** Expo SDK 56, React Native 0.85, React 19, TypeScript.
- **Key engineering value:** not only the model, but the integration of noise filtering, mode switching, on-device inference, persistence, visualisation, and evaluation data.

---

## Appendix A — Configuration Reference

| Area | Key | Value |
|---|---|---|
| GPS | `MIN_INTERVAL_MS` | 3000 |
| GPS | `MAX_ACCEPTABLE_ACCURACY` | 20 m |
| GPS | `MIN_SPEED_MPS` | 0.5 |
| GPS | `SMALL_STEP_THRESHOLD` | 8 m |
| GPS | `MAX_STEP_DISTANCE` | 500 m |
| GPS | `SMOOTHING_BUFFER_SIZE` | 5 |
| GPS | `STATIONARY_RADIUS` | 30 m |
| GPS | `STATIONARY_WINDOW` | 8 |
| GPS | `GPS_WARMUP_SECONDS` | 15 |
| GPS | `HEARTBEAT_INTERVAL_MS` | 30000 |
| Hybrid | `GPS_LOSS_THRESHOLD` | 5000 ms |
| Hybrid | `ACCURACY_THRESHOLD` | 20 m |
| Hybrid | `PREDICTION_INTERVAL` | 2000 ms |
| Hybrid | `MIN_POINTS_FOR_PREDICTION` | 10 |
| Hybrid | `MAX_BUFFERED_POINTS` | 100 |
| Model | `SEQUENCE_LENGTH` | 10 |
| Model | `NUM_FEATURES` | 4 |
| Model | `MODEL_LOAD_TIMEOUT` | 30000 ms |
| Storage | sessions key | `naija-gps-sessions` |
| Storage | theme key | `naija-gps-theme` |
| Storage | max sessions | 100 (defined) |

## Appendix B — Point Schema

| Field | Type | Description |
|---|---|---|
| `lat` | number | Latitude |
| `lon` | number | Longitude |
| `timestamp` | ISO string | Capture time |
| `speed` | number | Metres per second |
| `heading` | number | Degrees, 0–360 |
| `mode` | string | Tracking mode label |
| `source` | `gps` \| `ai` | Point origin |
| `accuracy` | number | GPS accuracy in metres |
| `confidence` | number | AI confidence, AI points only |
| `dx` | number | Predicted east-west displacement, AI points only |
| `dy` | number | Predicted north-south displacement, AI points only |
| `predicted` | boolean | True for AI points |
| `recordedMode` | string | `GPS_ONLY`, `HYBRID`, or `AI_ONLY` |
| `isHeartbeat` | boolean | Sparse stationary anchor point |

## Appendix C — Source File Index

```
src/app/_layout.tsx                  Root stack and providers
src/app/index.tsx                    Redirect to tabs
src/app/(tabs)/_layout.tsx           Tab navigation
src/app/(tabs)/index.tsx             Sessions list
src/app/(tabs)/tracker.js            Live tracking screen
src/app/(tabs)/settings.js           Settings screen
src/app/session-detail.tsx           Session detail and export
src/app/diagnostics.js               Diagnostics modal route

lib/hooks/useLocationTracking.js     GPS pipeline
lib/hooks/useHybridTracking.js       Hybrid state machine
lib/hooks/useAsyncStorage.js         Session persistence
lib/services/modelService.js         TF.js model loading
lib/services/predictionService.js    Inference and confidence
lib/services/exportService.js        JSON/CSV/GPX export
lib/services/diagnosticsService.js   Diagnostics observable
lib/store/sessionContext.js          Session CRUD context
lib/store/themeContext.js            Theme context
lib/store/diagnosticsContext.js      Diagnostics context
lib/utils/constants.js               Configuration
lib/utils/calculations.js            Geospatial maths
lib/utils/scaler.js                  Feature normalisation

src/components/OSMMapView.tsx        Leaflet map in WebView
src/components/MapOverlay.js         Map status overlay
src/components/BottomControls.js     Start/pause/stop controls

assets/model/model.json              Model topology
assets/model/group1-shard1of1.bin    Model weights
assets/model/model_info.json         Model metadata and metrics
assets/model/scaler.json             Feature scaling parameters
```

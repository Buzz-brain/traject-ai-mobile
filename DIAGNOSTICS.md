# AI Diagnostics System Documentation

## Overview

The AI Diagnostics System provides real-time monitoring and debugging capabilities for the TrajectAI mobile application's TensorFlow model, GPS tracking, and prediction functionality.

## Features

### 1. **TensorFlow Status**
- **Status Indicators**: Initializing → Ready / Failed
- **Initialization Tracking**: Monitors TensorFlow initialization on app startup
- **Error Reporting**: Captures and displays initialization errors

### 2. **AI Model Status**
- **Model Loading States**: Not Loaded → Loading → Loaded / Failed
- **Model Information**: Displays model info when loaded
- **Error Handling**: Reports model loading failures

### 3. **GPS Status**
- **Real-time Status**: Active / Inactive
- **Automatic Updates**: Updated when GPS points are recorded
- **Signal Quality**: Integrated with hybrid tracking

### 4. **Prediction Metrics**
- **Last Inference Time**: Measures time taken for prediction (in ms)
- **Total Inferences**: Cumulative prediction count
- **Prediction Errors**: Error count for debugging
- **Last Prediction Coordinates**: Latest predicted lat/lon

### 5. **Buffering Information**
- **Buffered GPS Points**: Current count of GPS points in buffer
- **Memory Management**: Tracks active sequence buffer

## Accessing the Diagnostics Screen

### Via Settings Tab
1. Open the app
2. Navigate to **Settings** tab
3. Scroll to **Developer** section
4. Tap **AI Diagnostics**

The diagnostics screen will open as a modal with real-time updates.

## Console Logging

The system logs key events to the browser/device console:

### TensorFlow Initialization
```
TensorFlow initialized successfully
```

### Model Loading
```
TrajectAI model loaded successfully
```

### Successful Prediction
```
Prediction generated successfully
Lat: 6.123456
Lon: 3.654321
Inference time: 45 ms
```

### Errors
```
[Diagnostics] TensorFlow initialization error: <error message>
[Diagnostics] Model loading error: <error message>
```

## Integration Points

### Diagnostics Service
**File**: `lib/services/diagnosticsService.js`

Core functions:
- `setTensorFlowInitializing()` - Called when TF initialization starts
- `setTensorFlowReady()` - Called when TF is ready
- `setTensorFlowError(error)` - Called on TF initialization error
- `setModelLoading()` - Called when model loading starts
- `setModelLoaded()` - Called when model loads successfully
- `setModelError(error)` - Called on model loading error
- `recordInference(lat, lon, inferenceTime)` - Called after successful prediction
- `recordInferenceError()` - Called on prediction failure
- `updateBufferedGpsPoints(count)` - Called when GPS buffer changes
- `setGpsActive()` - Called when GPS becomes active
- `setGpsInactive()` - Called when GPS becomes inactive

### Diagnostics Context
**File**: `lib/store/diagnosticsContext.js`

Provides global access to diagnostics state:
```javascript
import { useDiagnostics } from '../lib/store/diagnosticsContext';

function MyComponent() {
  const diagnostics = useDiagnostics();
  
  // Access diagnostics data
  console.log(diagnostics.tensorflowStatus);
  console.log(diagnostics.totalInferences);
}
```

### TensorFlow Initialization Hook
**File**: `lib/hooks/useTensorFlowInitialization.js`

Called automatically on app startup (in HomeScreen):
```javascript
import { useTensorFlowInitialization } from '../lib/hooks/useTensorFlowInitialization';

function HomeScreen() {
  useTensorFlowInitialization(); // Initializes on mount
  
  // Rest of component...
}
```

## Data Flow

```
┌─────────────────────────┐
│   App Startup           │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  useTensorFlowInitialization Hook   │
│  (in HomeScreen)                    │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  diagnosticsService.                │
│  setTensorFlowInitializing()        │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  TensorFlow Initialization          │
└────────────┬────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────┐
│  diagnosticsService.setTensorFlowReady() │
│  (or setTensorFlowError on failure)      │
└──────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  DiagnosticsContext Updated         │
│  (Triggers UI re-render)            │
└─────────────────────────────────────┘
```

## Prediction Flow with Diagnostics

```
┌──────────────────────┐
│  GPS Point Added     │
│  (addGpsPoint)       │
└────────┬─────────────┘
         │
         ↓
┌────────────────────────────────────┐
│  updateBufferedGpsPoints()         │
│  setGpsActive()                    │
└────────┬───────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Prediction Needed                    │
│  (predictNextLocation)               │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  diagnosticsService.                 │
│  startInference()                    │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Run TensorFlow Inference            │
└────────┬─────────────────────────────┘
         │
         ├──→ On Success:
         │    recordInference(lat, lon, time)
         │    Console: "Prediction generated successfully..."
         │
         └──→ On Error:
              recordInferenceError()
              Console: "[Diagnostics] TensorFlow inference error..."
```

## Status Badge Colors

| Status | Color | Meaning |
|--------|-------|---------|
| Initializing | Yellow | TensorFlow is starting up |
| Ready | Green | TensorFlow is ready to use |
| Active | Green | GPS is actively tracking |
| Loading | Blue | Model is loading from storage |
| Loaded | Green | Model successfully loaded |
| Failed | Red | Initialization or loading failed |
| Inactive | Gray | GPS is not active |
| Not Loaded | Gray | Model has not been loaded |
| Not Initialized | Gray | TensorFlow not initialized |

## Debug Tips

### Monitor Real-Time Predictions
1. Open Diagnostics screen
2. Watch "Last Inference Time" update with each prediction
3. Check "Total Inferences" counter
4. View latest predicted coordinates in real-time

### Check Error Status
1. Look for red "Failed" badges
2. Check error messages in the error boxes
3. Review console logs for stack traces
4. Check "Prediction Errors" counter

### Verify Model Loading
1. Watch "AI Model" status change from "Not Loaded" → "Loading" → "Loaded"
2. Monitor "Total Inferences" to confirm predictions are running
3. Check inference time to identify performance issues

### Monitor GPS Buffering
1. Watch "Buffered GPS Points" counter
2. Understand buffer fills as user moves
3. Verify buffer is maintained under 100 points

## Theme Support

The diagnostics screen fully supports light and dark themes:
- Automatically adapts to app theme setting
- Color scheme changes in Settings > Appearance > Dark Mode
- All text and backgrounds adjust accordingly

## Performance Considerations

- **Minimal Overhead**: Diagnostics runs in the background with negligible performance impact
- **Memory Efficient**: Uses lightweight state management
- **Non-blocking**: Does not interfere with GPS or prediction operations
- **Optional**: Diagnostics screen is only opened when user navigates to it

## Troubleshooting

### TensorFlow Shows "Failed"
- Check browser console for initialization errors
- Verify TensorFlow.js is properly imported
- Ensure compatible backend is available (WebGL, WASM, CPU)

### Model Shows "Not Loaded"
- Model loads on first prediction attempt
- Check that model file exists in assets/model/
- Verify MODEL_CONFIG.MODEL_PATH is correct

### No Predictions Recorded
- Check GPS Points buffer count
- Verify "AI Mode" is enabled in Settings
- Ensure model loads successfully first

### High Inference Times
- Normal for first inference (model warmup)
- Check device performance/CPU usage
- Reduce sequence length if needed

## Testing the Diagnostics

### Manual Test Checklist

- [ ] App starts without errors
- [ ] Settings > Developer > AI Diagnostics opens
- [ ] TensorFlow status changes from "Initializing" to "Ready"
- [ ] Console shows "TensorFlow initialized successfully"
- [ ] Start tracking session
- [ ] GPS points buffer updates in real-time
- [ ] Model loads when first prediction is made
- [ ] Console shows prediction logs
- [ ] Last prediction coordinates update with predictions
- [ ] Inference time is recorded
- [ ] Total inferences counter increments
- [ ] Dark mode properly styles the screen

## Future Enhancements

Potential improvements for the diagnostics system:

1. **Performance Graphs**: Real-time charts for inference time trends
2. **Batch Diagnostics**: Monitor multiple predictions simultaneously
3. **Memory Profiling**: Track TensorFlow memory usage
4. **Export Diagnostics**: Save diagnostics data to file
5. **Alerts**: Notifications for critical errors
6. **Sensor Integration**: Monitor accelerometer/gyroscope data
7. **Network Diagnostics**: Track API latency and sync issues
8. **Model Metrics**: Accuracy measurements vs GPS ground truth

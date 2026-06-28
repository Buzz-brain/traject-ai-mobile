import React from 'react';

// Explore tab should show GPS tracking.
// Your existing implementation lives under:
//   traject-ai-mobile/app/(tabs)/tracker.js
// Expo Router uses `src/app` as the route root, so we add the missing
// entrypoint here.
//
// This file is TypeScript; the real screen is plain JS. Import via require.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TrackerScreen = require('../../../app/(tabs)/tracker').default;

export default function TabExplore() {
  return React.createElement(TrackerScreen, null);
}



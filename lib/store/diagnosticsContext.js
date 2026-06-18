/**
 * Diagnostics Context
 * Provides global access to AI diagnostics state
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import diagnosticsService from '../services/diagnosticsService';

const DiagnosticsContext = createContext();

export function DiagnosticsProvider({ children }) {
  const [diagnostics, setDiagnostics] = useState(() => {
    try {
      return diagnosticsService.getDiagnosticsState();
    } catch (error) {
      console.error('[DiagnosticsContext] Failed to get initial state:', error);
      return {
        tensorflowStatus: 'not-initialized',
        tensorflowError: null,
        modelStatus: 'not-loaded',
        modelError: null,
        gpsStatus: 'inactive',
        lastInferenceTime: null,
        lastPredictionCoordinates: null,
        bufferedGpsPoints: 0,
        totalInferences: 0,
        totalPredictionErrors: 0,
      };
    }
  });

  useEffect(() => {
    try {
      const unsubscribe = diagnosticsService.addDiagnosticsListener((newState) => {
        setDiagnostics(newState);
      });

      return unsubscribe;
    } catch (error) {
      console.error('[DiagnosticsContext] Failed to add listener:', error);
      return () => {};
    }
  }, []);

  return (
    <DiagnosticsContext.Provider value={diagnostics}>
      {children}
    </DiagnosticsContext.Provider>
  );
}

export function useDiagnostics() {
  const context = useContext(DiagnosticsContext);
  if (!context) {
    console.warn('[useDiagnostics] Used outside of DiagnosticsProvider');
    return {
      tensorflowStatus: 'not-initialized',
      tensorflowError: null,
      modelStatus: 'not-loaded',
      modelError: null,
      gpsStatus: 'inactive',
      lastInferenceTime: null,
      lastPredictionCoordinates: null,
      bufferedGpsPoints: 0,
      totalInferences: 0,
      totalPredictionErrors: 0,
    };
  }
  return context;
}

export default DiagnosticsContext;

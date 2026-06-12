/**
 * Sensor Fusion Context Provider
 * Manages sensor data collection (prepared for Phase 2)
 * 
 * Phase 1: Infrastructure and stubs
 * Phase 2: Implement actual sensor integration
 */

import React, { createContext, useState, useEffect } from 'react';

export const SensorFusionContext = createContext();

export function SensorFusionProvider({ children }) {
  const [sensorData, setSensorData] = useState({
    accelerometer: null,
    gyroscope: null,
    magnetometer: null,
    deviceMotion: null,
  });
  const [isSensorEnabled, setIsSensorEnabled] = useState(false);

  useEffect(() => {
    // Phase 2: Initialize sensors
    // initializeSensors();
  }, []);

  const enableSensors = async () => {
    // Phase 2: Start sensor subscriptions
    console.log('[SensorFusionContext] Sensors enabled (stub)');
    setIsSensorEnabled(true);
  };

  const disableSensors = async () => {
    // Phase 2: Stop sensor subscriptions
    console.log('[SensorFusionContext] Sensors disabled (stub)');
    setIsSensorEnabled(false);
  };

  const getSensorReadings = () => {
    return sensorData;
  };

  const value = {
    sensorData,
    isSensorEnabled,
    enableSensors,
    disableSensors,
    getSensorReadings,
  };

  return (
    <SensorFusionContext.Provider value={value}>
      {children}
    </SensorFusionContext.Provider>
  );
}

/**
 * Hook to use sensor fusion context
 */
export function useSensorFusion() {
  const context = React.useContext(SensorFusionContext);
  if (!context) {
    throw new Error('useSensorFusion must be used within SensorFusionProvider');
  }
  return context;
}

export default SensorFusionContext;

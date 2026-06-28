import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapViewRN, { Marker, Polyline } from 'react-native-maps';
import type { GpsPoint } from '../lib/utils';

interface PredictedPoint {
  lat: number;
  lon: number;
  timestamp: string;
  predicted: boolean;
}

interface Props {
  points: GpsPoint[];
  currentPos: { lat: number; lon: number } | null;
  predictedPoints?: PredictedPoint[];
  showPredicted?: boolean;
}

export function MapView({ points = [], currentPos = null, predictedPoints = [], showPredicted = false }: Props) {
  const mapRef = useRef<MapViewRN | null>(null);

  useEffect(() => {
    if (!mapRef.current || !currentPos) return;
    mapRef.current.animateToRegion({
      latitude: currentPos.lat,
      longitude: currentPos.lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 500);
  }, [currentPos]);

  const coordinates = points.map(p => ({ latitude: p.lat, longitude: p.lon }));
  const predictedCoords = (predictedPoints || []).map(p => ({ latitude: p.lat, longitude: p.lon }));

  const initialRegion = currentPos
    ? {
        latitude: currentPos.lat,
        longitude: currentPos.lon,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }
    : { latitude: 9.0820, longitude: 8.6753, latitudeDelta: 5, longitudeDelta: 5 };

  return (
    <View style={styles.container}>
      <MapViewRN
        ref={(r) => { mapRef.current = r; }}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {coordinates.length > 0 && (
          <Polyline coordinates={coordinates} strokeColor="#10b981" strokeWidth={4} />
        )}

        {showPredicted && predictedCoords.length > 0 && (
          <Polyline coordinates={predictedCoords} strokeColor="#a855f7" strokeWidth={3} lineDashPattern={[6]} />
        )}

        {currentPos && (
          <Marker coordinate={{ latitude: currentPos.lat, longitude: currentPos.lon }} title="Current Position" />
        )}
      </MapViewRN>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});

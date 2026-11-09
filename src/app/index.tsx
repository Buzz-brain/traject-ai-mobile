import { useEffect } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#efeffd', '#dfe1ff', '#e9e6ff']}
      start={{ x: 0.15, y: 0.1 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.background}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.deviceFrame}>
          <LinearGradient
            colors={['rgba(255,255,255,0.72)', 'rgba(255,255,255,0.46)']}
            style={styles.glassShell}
          >
            <View style={styles.statusBar}>
              <Text style={styles.time}>9:41</Text>
              <View style={styles.statusIcons}>
                <View style={styles.signalDot} />
                <View style={styles.signalDot} />
                <View style={styles.signalDot} />
                <View style={styles.battery} />
              </View>
            </View>

            <View style={styles.logoWrap}>
              <View style={styles.logoCircle}>
                <View style={styles.logoInnerGlow} />
                <View style={styles.pinHead} />
                <View style={styles.pinTail} />
              </View>
            </View>

            <Text style={styles.brand}>TrajectAI</Text>
            <Text style={styles.tagline}>Track Smarter.{'\n'}Predict Further.</Text>

            <View style={styles.cityScene}>
              <View style={styles.skyline}>
                <View style={[styles.building, styles.buildingTall]} />
                <View style={[styles.building, styles.buildingMid]} />
                <View style={[styles.building, styles.buildingShort]} />
                <View style={[styles.building, styles.buildingTall2]} />
                <View style={[styles.building, styles.buildingWide]} />
              </View>
            </View>

            <View style={styles.dotRow}>
              <View style={styles.dot} />
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
            </View>
          </LinearGradient>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceFrame: {
    width: width * 0.8,
    maxWidth: 360,
    aspectRatio: 0.54,
    borderRadius: 28,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    shadowColor: '#4c3d9f',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  glassShell: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    marginBottom: 12,
  },
  time: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2141',
    letterSpacing: 0.2,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1f2141',
    opacity: 0.8,
  },
  battery: {
    width: 18,
    height: 10,
    borderRadius: 3,
    borderWidth: 1.3,
    borderColor: '#1f2141',
    backgroundColor: 'transparent',
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  logoCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#f5f2ff',
    borderWidth: 2,
    borderColor: '#c9c3ff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoInnerGlow: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#dfe6ff',
    opacity: 0.8,
  },
  pinHead: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#7b67ff',
    borderWidth: 3,
    borderColor: '#ffffff',
    zIndex: 2,
    transform: [{ rotate: '-10deg' }],
  },
  pinTail: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 12,
    backgroundColor: '#7b67ff',
    transform: [{ rotate: '45deg' }],
    bottom: 16,
    left: 34,
    zIndex: 1,
    opacity: 0.65,
  },
  brand: {
    marginTop: 24,
    fontSize: 34,
    fontWeight: '800',
    color: '#1d1a3a',
    textAlign: 'center',
    letterSpacing: -1.2,
  },
  tagline: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '600',
    color: '#4d4c67',
    textAlign: 'center',
    lineHeight: 20,
  },
  cityScene: {
    marginTop: 28,
    height: 120,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  skyline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingBottom: 0,
    height: 120,
    backgroundColor: 'transparent',
  },
  building: {
    backgroundColor: '#7d6ef8',
    borderRadius: 4,
    opacity: 0.9,
    marginRight: 3,
  },
  buildingTall: {
    width: 24,
    height: 72,
  },
  buildingMid: {
    width: 18,
    height: 56,
    opacity: 0.8,
  },
  buildingShort: {
    width: 20,
    height: 48,
    opacity: 0.7,
  },
  buildingTall2: {
    width: 26,
    height: 84,
  },
  buildingWide: {
    width: 42,
    height: 66,
    opacity: 0.85,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d0d1f4',
  },
  dotActive: {
    width: 26,
    height: 10,
    borderRadius: 20,
    backgroundColor: '#7d6ef8',
  },
});

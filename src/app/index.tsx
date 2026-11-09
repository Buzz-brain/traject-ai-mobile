import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Track every route',
    description: 'See live movement, distance, and accuracy in one premium view.',
    accent: '#7c6cff',
    illustration: 'route',
  },
  {
    title: 'Predict with AI',
    description: 'Fallback predictions stay accurate when GPS signal drops.',
    accent: '#8b5cf6',
    illustration: 'predict',
  },
  {
    title: 'Review every trip',
    description: 'Export clean analytics, compare performance, and improve future routes.',
    accent: '#5b50d4',
    illustration: 'stats',
  },
] as const;

export default function SplashScreen() {
  const [phase, setPhase] = useState<'splash' | 'onboarding'>('splash');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setPhase('onboarding');
    }, 1800);

    return () => clearTimeout(splashTimer);
  }, []);

  const currentSlide = slides[index];

  const goNext = () => {
    if (index < slides.length - 1) {
      setIndex((prev) => prev + 1);
      return;
    }

    router.replace('/(tabs)');
  };

  const skipToEnd = () => {
    router.replace('/(tabs)');
  };

  if (phase === 'splash') {
    return (
      <LinearGradient
        colors={['#f2f0ff', '#e8e4ff', '#f0ebff']}
        start={{ x: 0.15, y: 0.1 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.background}
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.deviceFrame}>
            <LinearGradient
              colors={['rgba(255,255,255,0.74)', 'rgba(255,255,255,0.42)']}
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
              <Text style={styles.tagline}>{'Track Smarter.\nPredict Further.'}</Text>

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

  return (
    <LinearGradient
      colors={['#f2f0ff', '#e9e5ff', '#f5f3ff']}
      start={{ x: 0.2, y: 0.2 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.background}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.onboardingFrame}>
          <LinearGradient
            colors={['rgba(255,255,255,0.73)', 'rgba(255,255,255,0.38)']}
            style={styles.onboardingShell}
          >
            <View style={styles.onboardingHeader}>
              <Text style={styles.onboardingTime}>9:41</Text>
              <View style={styles.onboardingIcons}>
                <View style={styles.signalDot} />
                <View style={styles.signalDot} />
                <View style={styles.signalDot} />
                <View style={styles.battery} />
              </View>
            </View>

            <View style={styles.onboardingIllustrationWrap}>
              <LinearGradient
                colors={[currentSlide.accent, '#8a7bff']}
                style={styles.onboardingGlow}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />

              {currentSlide.illustration === 'route' && (
                <View style={styles.illustrationCard}>
                  <View style={styles.routeMap}>
                    <View style={styles.routeLine} />
                    <View style={styles.routeDot} />
                    <View style={[styles.routeDot, styles.routeDotTwo]} />
                    <View style={[styles.routeDot, styles.routeDotThree]} />
                  </View>
                </View>
              )}

              {currentSlide.illustration === 'predict' && (
                <View style={styles.illustrationCard}>
                  <View style={styles.aiPanel}>
                    <View style={styles.aiBubble} />
                    <View style={styles.aiBubbleSmall} />
                    <View style={styles.aiPulse} />
                  </View>
                </View>
              )}

              {currentSlide.illustration === 'stats' && (
                <View style={styles.illustrationCard}>
                  <View style={styles.statsPanel}>
                    <View style={styles.statsBar} />
                    <View style={[styles.statsBar, styles.statsBarMedium]} />
                    <View style={[styles.statsBar, styles.statsBarShort]} />
                    <View style={[styles.statsBar, styles.statsBarWide]} />
                  </View>
                </View>
              )}
            </View>

            <Text style={styles.onboardingTitle}>{currentSlide.title}</Text>
            <Text style={styles.onboardingDescription}>{currentSlide.description}</Text>

            <View style={styles.dotRow}>
              {slides.map((_, dotIndex) => (
                <View
                  key={dotIndex}
                  style={[
                    styles.dot,
                    dotIndex === index && styles.dotActive,
                  ]}
                />
              ))}
            </View>

            <View style={styles.onboardingFooter}>
              <TouchableOpacity onPress={skipToEnd}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.nextButton} onPress={goNext} activeOpacity={0.9}>
                <Text style={styles.nextText}>{index === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
              </TouchableOpacity>
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
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
    marginTop: 26,
    height: 128,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: 'rgba(124,94,255,0.06)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  skyline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 0,
    height: 128,
    backgroundColor: 'transparent',
  },
  building: {
    backgroundColor: '#7d6ef8',
    borderRadius: 5,
    opacity: 0.92,
    marginRight: 3,
    shadowColor: '#5f51d9',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
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
  onboardingFrame: {
    width: width * 0.82,
    maxWidth: 360,
    aspectRatio: 0.54,
    borderRadius: 28,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#4c3d9f',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  onboardingShell: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  onboardingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    marginBottom: 18,
  },
  onboardingTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d1b35',
    letterSpacing: 0.2,
  },
  onboardingIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onboardingIllustrationWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginTop: 8,
    marginBottom: 16,
  },
  onboardingGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.25,
  },
  illustrationCard: {
    width: 180,
    height: 160,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.40)',
    borderWidth: 1,
    borderColor: 'rgba(129,113,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  routeMap: {
    width: 150,
    height: 120,
    borderRadius: 18,
    backgroundColor: 'rgba(73,63,161,0.08)',
    position: 'relative',
  },
  routeLine: {
    position: 'absolute',
    width: 120,
    height: 80,
    borderWidth: 4,
    borderColor: '#7c6cff',
    borderRadius: 50,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    transform: [{ rotate: '18deg' }],
    left: 18,
    top: 18,
  },
  routeDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7c6cff',
    left: 28,
    top: 80,
  },
  routeDotTwo: {
    left: 92,
    top: 54,
    backgroundColor: '#9d8bff',
  },
  routeDotThree: {
    left: 118,
    top: 30,
    backgroundColor: '#5b50d4',
  },
  aiPanel: {
    width: 142,
    height: 122,
    borderRadius: 20,
    backgroundColor: 'rgba(92,76,198,0.08)',
    position: 'relative',
  },
  aiBubble: {
    position: 'absolute',
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#7c6cff',
    top: 22,
    left: 32,
    opacity: 0.8,
  },
  aiBubbleSmall: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d9d4ff',
    top: 38,
    left: 68,
    opacity: 0.9,
  },
  aiPulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(124,108,255,0.55)',
    top: 0,
    left: 12,
  },
  statsPanel: {
    width: 150,
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
    backgroundColor: 'rgba(73,63,161,0.06)',
    borderRadius: 18,
  },
  statsBar: {
    width: 112,
    height: 12,
    borderRadius: 10,
    backgroundColor: '#7c6cff',
    marginBottom: 8,
    opacity: 0.9,
  },
  statsBarMedium: {
    width: 92,
    height: 12,
    backgroundColor: '#9d8bff',
  },
  statsBarShort: {
    width: 72,
    height: 12,
    backgroundColor: '#c9c2ff',
  },
  statsBarWide: {
    width: 110,
    height: 12,
    backgroundColor: '#6d5efc',
  },
  onboardingTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1e1a39',
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  onboardingDescription: {
    fontSize: 14,
    color: '#4a4b61',
    textAlign: 'center',
    lineHeight: 20,
    marginHorizontal: 12,
    marginBottom: 18,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d6d2ff',
  },
  dotActive: {
    width: 30,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#6c63ff',
  },
  onboardingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#504d6a',
  },
  nextButton: {
    backgroundColor: '#6c63ff',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#5d51ee',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  nextText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});

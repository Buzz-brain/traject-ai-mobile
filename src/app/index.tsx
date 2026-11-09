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
import { Image } from 'expo-image';
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
      <View style={styles.splashScreen}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <Image
          source={require('../../assets/images/splash-screen.png')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="bottom"
        />
      </View>
    );
  }

  if (index === 0) {
    return (
      <LinearGradient
        colors={['#f3f1ff', '#ece9ff', '#f8f5ff']}
        start={{ x: 0.1, y: 0.2 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.background}
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <SafeAreaView style={styles.onboardingOneSafeArea}>
          <View style={styles.onboardingOneScreen}>
            <View style={styles.onboardingOneBlob} />

            <View style={styles.onboardingOneScene}>
              <View style={styles.phoneWrap}>
                <View style={styles.phoneFrame}>
                  <Image
                    source={require('../../onboarding-img-one.png')}
                    style={styles.phoneImage}
                    contentFit="cover"
                  />
                </View>
              </View>

              <View style={styles.satelliteWrap}>
                <View style={styles.satelliteBody}>
                  <View style={styles.satelliteDish} />
                </View>
                <View style={styles.signalRing} />
                <View style={styles.signalRingSmall} />
              </View>

              <View style={styles.treeWrap}>
                <View style={styles.treeTrunk} />
                <View style={styles.treeLeaf} />
              </View>
            </View>

            <Text style={styles.onboardingOneTitle}>{'Real-Time\nGPS Tracking'}</Text>
            <Text style={styles.onboardingOneDescription}>{'Track your movement with\nhigh precision GPS.'}</Text>

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

            <TouchableOpacity style={styles.onboardingOneNextButton} onPress={goNext} activeOpacity={0.9}>
              <Text style={styles.onboardingOneNextText}>{index === slides.length - 1 ? 'Get Started' : 'Next'} {'→'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={skipToEnd}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
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
            colors={['rgba(255,255,255,0.72)', 'rgba(255,255,255,0.38)']}
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
  splashScreen: {
    flex: 1,
    backgroundColor: '#F1EFFD',
  },
  onboardingOneSafeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingOneScreen: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
    paddingBottom: 26,
    position: 'relative',
  },
  onboardingOneBlob: {
    position: 'absolute',
    width: 680,
    height: 520,
    borderRadius: 340,
    backgroundColor: 'rgba(165,150,245,0.16)',
    top: 90,
    left: '50%',
    transform: [{ translateX: -340 }],
  },
  onboardingOneScene: {
    width: 390,
    height: 500,
    marginTop: 8,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneWrap: {
    position: 'relative',
    zIndex: 2,
    transform: [{ rotate: '6deg' }],
  },
  phoneFrame: {
    width: 300,
    height: 500,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 0,
    shadowColor: '#4d3e90',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 18 },
    elevation: 12,
    borderWidth: 0,
  },
  phoneImage: {
    flex: 1,
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: '#f3f3f6',
  },
  satelliteWrap: {
    position: 'absolute',
    right: 18,
    top: 36,
    width: 110,
    height: 110,
    transform: [{ rotate: '18deg' }],
    zIndex: 3,
  },
  satelliteBody: {
    position: 'absolute',
    width: 88,
    height: 54,
    borderRadius: 26,
    backgroundColor: '#7a68ff',
    left: 16,
    top: 28,
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#5d4ec7',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  satelliteDish: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 6,
    borderColor: '#7a68ff',
    left: 0,
    top: 18,
    transform: [{ rotate: '45deg' }],
  },
  signalRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#8b7cff',
    left: 10,
    top: 8,
    opacity: 0.9,
  },
  signalRingSmall: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    borderColor: '#8b7cff',
    left: 24,
    top: 32,
    opacity: 0.8,
  },
  treeWrap: {
    position: 'absolute',
    left: 8,
    bottom: 12,
    width: 54,
    height: 72,
    zIndex: 3,
  },
  treeTrunk: {
    position: 'absolute',
    width: 10,
    height: 26,
    backgroundColor: '#7d9f5d',
    borderRadius: 20,
    left: 22,
    bottom: 0,
  },
  treeLeaf: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 24,
    backgroundColor: '#8ae28a',
    left: 4,
    bottom: 18,
    shadowColor: '#6fbf6a',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  onboardingOneTitle: {
    fontSize: 35,
    fontWeight: '800',
    color: '#1f1b3b',
    textAlign: 'center',
    letterSpacing: -1.2,
    lineHeight: 38,
    marginTop: 12,
  },
  onboardingOneDescription: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '500',
    color: '#4a4a64',
    textAlign: 'center',
    lineHeight: 26,
  },
  onboardingOneNextButton: {
    marginTop: 20,
    width: 230,
    paddingVertical: 18,
    borderRadius: 18,
    backgroundColor: '#6e5afc',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5f49ee',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  onboardingOneNextText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.4,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashFrame: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  splashCard: {
    width: 360,
    maxWidth: '90%',
    height: 640,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 28,
    borderWidth: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  logoWrap: {
    marginTop: 6,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#f6f2ff',
    borderWidth: 3,
    borderColor: '#d5cdfd',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  logoArc: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 5,
    borderColor: '#7b67ff',
    borderLeftColor: '#7b67ff',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    transform: [{ rotate: '32deg' }],
  },
  logoPin: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#7b67ff',
    borderWidth: 3,
    borderColor: '#ffffff',
    top: 26,
    left: 23,
    zIndex: 2,
  },
  logoTail: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7b67ff',
    transform: [{ rotate: '45deg' }],
    left: 35,
    top: 42,
    opacity: 0.8,
  },
  splashTitle: {
    fontSize: 44,
    fontWeight: '800',
    color: '#1f1c3d',
    letterSpacing: -1.8,
    textAlign: 'center',
    marginBottom: 10,
  },
  splashTaglineWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 6,
  },
  splashTagline: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#4e4c68',
    textAlign: 'center',
  },
  skylineWrap: {
    width: '100%',
    height: 260,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  skyline: {
    width: '100%',
    height: 200,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  building: {
    backgroundColor: '#7b67ff',
    borderRadius: 4,
    opacity: 0.92,
  },
  buildingTall1: {
    width: 24,
    height: 86,
    opacity: 0.78,
  },
  buildingShort1: {
    width: 18,
    height: 52,
    opacity: 0.7,
  },
  buildingMid1: {
    width: 28,
    height: 68,
    opacity: 0.84,
  },
  buildingTall2: {
    width: 24,
    height: 92,
  },
  buildingWide: {
    width: 42,
    height: 74,
    opacity: 0.85,
  },
  buildingShort2: {
    width: 20,
    height: 58,
    opacity: 0.8,
  },
  splashFooterDot: {
    width: 18,
    height: 18,
    marginTop: 22,
    borderRadius: 9,
    backgroundColor: '#7b67ff',
    opacity: 0.9,
  },
  heroPage: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 28,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  heroGrid: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1280,
    width: '100%',
    marginHorizontal: 'auto',
  },
  heroGridCompact: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 18,
  },
  heroTextBlock: {
    flex: 1,
    maxWidth: 500,
    paddingRight: 18,
    justifyContent: 'center',
  },
  heroTextBlockCompact: {
    maxWidth: '100%',
    paddingRight: 0,
    alignItems: 'center',
    width: '100%',
  },
  brandMarkWrap: {
    marginBottom: 18,
    alignItems: 'flex-start',
  },
  brandMark: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#f4efff',
    borderWidth: 2,
    borderColor: '#d4caff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  brandOrbit: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 5,
    borderColor: '#7b67ff',
    transform: [{ rotate: '24deg' }],
    opacity: 0.9,
  },
  brandPin: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#7b67ff',
    borderWidth: 3,
    borderColor: '#ffffff',
    top: 27,
    left: 22,
    zIndex: 2,
  },
  brandPinDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7b67ff',
    transform: [{ rotate: '45deg' }],
    left: 35,
    top: 43,
    opacity: 0.8,
  },
  brand: {
    marginTop: 0,
    fontSize: 56,
    fontWeight: '800',
    color: '#18173a',
    textAlign: 'left',
    letterSpacing: -1.8,
  },
  tagline: {
    marginTop: 8,
    fontSize: 21,
    fontWeight: '600',
    color: '#474763',
    textAlign: 'left',
    lineHeight: 28,
  },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
    maxWidth: 260,
  },
  splashBackCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#d7d1ff',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  splashNextButton: {
    backgroundColor: '#6a5afc',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: '#5d4cf2',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    minWidth: 140,
    alignItems: 'center',
  },
  heroVisualPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 420,
  },
  heroVisualPanelCompact: {
    width: '100%',
    minHeight: 280,
  },
  visualCard: {
    width: '100%',
    maxWidth: 520,
    height: 430,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.38)',
    borderWidth: 1,
    borderColor: 'rgba(190,181,255,0.45)',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    shadowColor: '#4e3eaf',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  visualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  visualTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e1b39',
    letterSpacing: 0.2,
  },
  visualStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signal: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1d1b35',
    opacity: 0.8,
  },
  signalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1d1b35',
    opacity: 0.8,
  },
  battery: {
    width: 18,
    height: 10,
    borderRadius: 3,
    borderWidth: 1.4,
    borderColor: '#1d1b35',
    backgroundColor: 'transparent',
  },
  mapPreview: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: '#f2f9f5',
    borderWidth: 1,
    borderColor: 'rgba(108, 89, 226, 0.12)',
    overflow: 'hidden',
    position: 'relative',
  },
  mapGrid: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(110, 176, 137, 0.18)',
  },
  routePath: {
    position: 'absolute',
    width: 220,
    height: 140,
    borderWidth: 5,
    borderColor: '#5a4ae5',
    borderRadius: 80,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    transform: [{ rotate: '-22deg' }],
    left: 90,
    top: 130,
  },
  routeNodeA: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#5a4ae5',
    top: 190,
    left: 110,
  },
  routeNodeB: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3ce0a5',
    top: 120,
    right: 118,
    borderWidth: 4,
    borderColor: '#edfef6',
  },
  routeBadge: {
    position: 'absolute',
    width: 90,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.78)',
    top: 20,
    right: 24,
  },
  cityGlow: {
    position: 'absolute',
    width: 250,
    height: 70,
    left: 20,
    bottom: 0,
    backgroundColor: 'rgba(122,104,255,0.3)',
    borderTopLeftRadius: 80,
    borderTopRightRadius: 40,
  },
  mapMetricRow: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricPill: {
    width: 110,
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(122,104,255,0.72)',
  },
  metricPillShort: {
    width: 68,
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(80, 206, 130, 0.82)',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  navDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#d9d4ff',
  },
  onboardingFrame: {
    width: Math.min(width * 0.82, 360),
    maxWidth: 360,
    aspectRatio: 0.56,
    borderRadius: 30,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
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
    paddingBottom: 16,
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
    height: 220,
    marginTop: 10,
    marginBottom: 18,
  },
  onboardingGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.22,
  },
  illustrationCard: {
    width: 205,
    height: 180,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(129,113,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  routeMap: {
    width: 180,
    height: 150,
    borderRadius: 24,
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
    fontSize: 29,
    fontWeight: '800',
    color: '#1e1a39',
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  onboardingDescription: {
    fontSize: 14,
    color: '#4a4b61',
    textAlign: 'center',
    lineHeight: 20,
    marginHorizontal: 12,
    marginBottom: 14,
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
    paddingTop: 6,
    paddingHorizontal: 4,
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

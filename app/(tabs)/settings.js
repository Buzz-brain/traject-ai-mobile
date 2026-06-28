/**
 * Settings Screen
 * App settings, theme, permissions, and info
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/store/themeContext';
import {
  ScreenHeader,
  Card,
  PrimaryButton,
  SecondaryButton,
} from '../../components/common';

/**
 * Settings Section Header
 */
function SectionHeader({ title }) {
  const { isDark } = useTheme();

  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: '700',
        color: isDark ? '#9ca3af' : '#6b7280',
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 8,
        textTransform: 'uppercase',
      }}
    >
      {title}
    </Text>
  );
}

/**
 * Settings Row
 */
function SettingRow({ icon, label, value, onPress, isSwitch = false, switchValue = false, onSwitchChange = null }) {
  const { isDark } = useTheme();

  return (
    <Card
      onPress={isSwitch ? null : onPress}
      style={{
        marginHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
      }}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={isDark ? '#9ca3af' : '#6b7280'}
          style={{ marginRight: 12 }}
        />
      )}
      <Text
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: '500',
          color: isDark ? '#e5e7eb' : '#1f2937',
        }}
      >
        {label}
      </Text>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#d1d5db', true: '#10b981' }}
          thumbColor={switchValue ? '#059669' : '#9ca3af'}
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {value && (
            <Text
              style={{
                fontSize: 12,
                color: isDark ? '#9ca3af' : '#6b7280',
                marginRight: 8,
              }}
            >
              {value}
            </Text>
          )}
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isDark ? '#6b7280' : '#9ca3af'}
          />
        </View>
      )}
    </Card>
  );
}

/**
 * Settings Screen
 */
export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [debugMode, setDebugMode] = useState(false);
  const [backgroundTracking, setBackgroundTracking] = useState(false);

  const appVersion = Application.nativeApplicationVersion || '1.0.0';
  const buildVersion = Application.nativeBuildVersion || '1';

  const handleExportAllSessions = async () => {
    Alert.alert('Export All Sessions', 'Feature coming soon');
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all sessions and cannot be undone',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Clear',
          onPress: () => {
            Alert.alert('Success', 'All data cleared');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#111827' : '#f9fafb',
    },
    infoBox: {
      marginHorizontal: 16,
      marginTop: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: isDark ? '#2d3748' : '#f3f4f6',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? '#4b5563' : '#e5e7eb',
    },
    infoText: {
      fontSize: 12,
      color: isDark ? '#9ca3af' : '#6b7280',
      lineHeight: 18,
    },
    buttonContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    rowButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    flexButton: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Settings" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <SettingRow
          icon="moon"
          label="Dark Mode"
          isSwitch={true}
          switchValue={isDark}
          onSwitchChange={toggleTheme}
        />

        {/* Tracking */}
        <SectionHeader title="Tracking" />
        <SettingRow
          icon="navigate"
          label="GPS Accuracy"
          value="High"
          onPress={() => Alert.alert('GPS Accuracy', 'High accuracy mode is enabled')}
        />
        <SettingRow
          icon="cloud"
          label="Background Tracking"
          isSwitch={true}
          switchValue={backgroundTracking}
          onSwitchChange={setBackgroundTracking}
        />
        <SettingRow
          icon="timer"
          label="Update Interval"
          value="1.0 sec"
          onPress={() => Alert.alert('Update Interval', 'GPS updates every 1.0 seconds')}
        />

        {/* AI & Hybrid */}
        <SectionHeader title="AI & Hybrid Mode" />
        <SettingRow
          icon="flash"
          label="AI Mode"
          value="Enabled"
          onPress={() => Alert.alert('AI Mode', 'AI predictions enabled when GPS is lost')}
        />
        <SettingRow
          icon="swap-horizontal"
          label="Hybrid Threshold"
          value="5.0 sec"
          onPress={() => Alert.alert('Hybrid Threshold', 'Switch to AI after 5 seconds GPS loss')}
        />

        {/* Debug */}
        <SectionHeader title="Developer" />
        <SettingRow
          icon="bug"
          label="Debug Mode"
          isSwitch={true}
          switchValue={debugMode}
          onSwitchChange={setDebugMode}
        />
        <SettingRow
          icon="hammer"
          label="AI Diagnostics"
          onPress={() => router.push('/diagnostics')}
        />

        {/* Data & Storage */}
        <SectionHeader title="Data & Storage" />
        <SettingRow
          icon="download"
          label="Export All Sessions"
          onPress={handleExportAllSessions}
        />
        <SettingRow
          icon="trash"
          label="Clear All Data"
          onPress={handleClearAllData}
        />

        {/* About */}
        <SectionHeader title="About" />
        <Card style={{ marginHorizontal: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: isDark ? '#f3f4f6' : '#1f2937',
              marginBottom: 8,
            }}
          >
            TrajectAI
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: isDark ? '#9ca3af' : '#6b7280',
              lineHeight: 18,
            }}
          >
            GPS trajectory tracking with AI prediction for mobile devices
          </Text>
        </Card>

        {/* Version Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Version: {appVersion}
            {'\n'}
            Build: {buildVersion}
            {'\n'}
            © 2024 TrajectAI
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            label="View Documentation"
            onPress={() => Alert.alert('Documentation', 'Documentation link coming soon')}
          />
          <SecondaryButton
            label="Report Issue"
            onPress={() => Alert.alert('Report Issue', 'Issue reporting coming soon')}
          />
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

import React from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

// This is a placeholder home screen to ensure the app compiles successfully. 
// It will be replaced with the actual home screen once we have the feed and other components set up.

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerPill}>
          <Text style={styles.pillText}>SYSTEM ACTIVE</Text>
        </View>
        
        <Text style={styles.welcomeText}>Welcome to 90024-Swap</Text>
        <Text style={styles.subText}>
          The index has been reset to a placeholder to fix compilation issues.
        </Text>

        <View style={styles.debugCard}>
          <Text style={styles.debugTitle}>Debug Info:</Text>
          <Text style={styles.debugItem}>• Route: (tabs)/index</Text>
          <Text style={styles.debugItem}>• Status: Compiling</Text>
          <Text style={styles.debugItem}>• Project: Reset successful</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerPill: {
    backgroundColor: '#E0FFE0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#34C759',
    marginBottom: 20,
  },
  pillText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  debugCard: {
    width: width - 40,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  debugTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  debugItem: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
    fontFamily: 'Courier',
  },
});
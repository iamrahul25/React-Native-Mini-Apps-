//Code of App.js File

//Dependencies: expo-sensors
// npx expo install expo-sensors

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { LightSensor } from 'expo-sensors';

export default function App() {
  const [{ illuminance }, setData] = useState({ illuminance: 0 });
  const [subscription, setSubscription] = useState(null);
  const updateInterval = 1 * 1000; // Update every t seconds (e.g., 1 seconds)

  const subscribe = () => {
    setSubscription(
      LightSensor.addListener(sensorData => {
        setData(sensorData);
      })
    );

    // Set the update interval
    LightSensor.setUpdateInterval(updateInterval);
  };

  const unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, []);

  const isNightTime = illuminance < 50;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {isNightTime ? "🌃 It's Night time" : "☀️ It's Day time"}
      </Text>
      <Text style={styles.text}>
        Illuminance: {Platform.OS === 'android' ? `${illuminance} lx` : 'Only available on Android'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  text: {
    textAlign: 'center',
    fontSize: 18,
    marginVertical: 10,
  },
});

//This app gives notifications after every 10 seconds
//Code: app.js

import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const BACKGROUND_TASK_NAME = 'background-task-10-seconds';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          schedulePushNotification();
          return 10; // Reset timer
        }
        return prevTime - 1;
      });
    }, 1000);

    registerBackgroundTask();

    return () => {
      clearInterval(timer);
      unregisterBackgroundTask();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Time Left: {timeLeft} seconds</Text>
    </View>
  );
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time's Up!",
      body: '10 seconds have passed.',
    },
    trigger: null, // Immediate trigger
  });
}

async function registerBackgroundTask() {
  if (TaskManager.isTaskDefined(BACKGROUND_TASK_NAME)) {
    console.log(`Task ${BACKGROUND_TASK_NAME} is already defined`);
  } else {
    TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
      console.log(`Running background task: ${BACKGROUND_TASK_NAME}`);
      await schedulePushNotification();
      return BackgroundFetch.Result.NewData;
    });
  }

  const registeredTasks = await TaskManager.getRegisteredTasksAsync();
  if (registeredTasks.find(task => task.taskName === BACKGROUND_TASK_NAME) === undefined) {
    console.log('Registering background task:', BACKGROUND_TASK_NAME);
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: 10, // 10 seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
}

async function unregisterBackgroundTask() {
  await TaskManager.unregisterTaskAsync(BACKGROUND_TASK_NAME);
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
    fontSize: 24,
    marginVertical: 20,
  },
});

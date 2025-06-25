import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Item } from '../types';
import { getDaysUntil } from './dateUtils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }
    } else {
      console.log('Notifications require a physical device or development build');
    }
  } catch (error) {
    console.log('Notification setup failed (expected in Expo Go):', error);
  }
}

export async function scheduleEventReminders(events: Item[]) {
  try {
    // For development in Expo Go, we'll just show immediate notifications for testing
    // In a production app, you'd use a development build for full notification support
    
    const todayEvents = events.filter(event => {
      if (!event.date) return false;
      return getDaysUntil(event.date) === 0;
    });
    
    const tomorrowEvents = events.filter(event => {
      if (!event.date) return false;
      return getDaysUntil(event.date) === 1;
    });
    
    // Show immediate notification if there are events today
    if (todayEvents.length > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Don't forget me",
          body: `You have ${todayEvents.length} event(s) today!`,
          data: { type: 'today' },
        },
        trigger: null, // Immediate
      });
    }
    
    // Show notification for tomorrow events (immediate for testing in Expo Go)
    if (tomorrowEvents.length > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Don't forget me",
          body: `You have ${tomorrowEvents.length} event(s) tomorrow!`,
          data: { type: 'tomorrow' },
        },
        trigger: null, // Immediate for Expo Go compatibility
      });
    }
    
    console.log(`Scheduled notifications for ${todayEvents.length} today and ${tomorrowEvents.length} tomorrow events`);
  } catch (error) {
    console.log('Notification scheduling failed (this is expected in Expo Go):', error);
  }
}

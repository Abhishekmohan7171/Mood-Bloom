import { Injectable } from '@angular/core';
import { NotificationSettings } from '../models/mood.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationPermission: NotificationPermission = 'default';

  constructor() {
    this.checkNotificationPermission();
  }

  private async checkNotificationPermission(): Promise<void> {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      return permission === 'granted';
    }
    return false;
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if (this.notificationPermission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  }

  scheduleReminder(settings: NotificationSettings): void {
    if (!settings.dailyReminder) return;

    const now = new Date();
    const [hours, minutes] = settings.reminderTime.split(':').map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      this.showNotification('Mood Check-in', {
        body: 'How are you feeling today? Take a moment to log your mood.',
        tag: 'daily-reminder'
      });
      
      // Schedule the next reminder
      this.scheduleReminder(settings);
    }, timeUntilReminder);
  }

  showStreakNotification(streak: number): void {
    if (streak > 0 && streak % 7 === 0) {
      this.showNotification('Streak Achievement! 🎉', {
        body: `Amazing! You've tracked your mood for ${streak} days in a row!`,
        tag: 'streak-notification'
      });
    }
  }

  showWeeklyReflection(): void {
    this.showNotification('Weekly Reflection', {
      body: 'Take a moment to reflect on your week. How have you been feeling?',
      tag: 'weekly-reflection'
    });
  }
}
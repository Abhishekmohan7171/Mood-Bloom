import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MoodStorageService } from '../services/mood-storage.service';
import { NotificationService } from '../services/notification.service';
import { AppSettings } from '../models/mood.interface';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Appearance Settings - COMMENTED OUT -->
      <!--
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center space-x-2">
          <span class="text-2xl">🎨</span>
          <span>Appearance</span>
        </h3>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</label>
              <p class="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
            </div>
            <button
              (click)="toggleDarkMode()"
              [class]="getDarkModeToggleClass()"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                [class]="getDarkModeToggleSpanClass()"
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              ></span>
            </button>
          </div>
        </div>
      </div>
      -->

      <!-- Notification Settings -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center space-x-2">
          <span class="text-2xl">🔔</span>
          <span>Notifications</span>
        </h3>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Reminders</label>
              <p class="text-xs text-gray-500 dark:text-gray-400">Get reminded to log your mood</p>
            </div>
            <input
              type="checkbox"
              [(ngModel)]="settings().notifications.dailyReminder"
              (change)="updateNotificationSettings()"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          
          @if (settings().notifications.dailyReminder) {
            <div class="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reminder Time
              </label>
              <input
                type="time"
                [(ngModel)]="settings().notifications.reminderTime"
                (change)="updateNotificationSettings()"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          }
          
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Reflection</label>
              <p class="text-xs text-gray-500 dark:text-gray-400">Weekly mood reflection reminders</p>
            </div>
            <input
              type="checkbox"
              [(ngModel)]="settings().notifications.weeklyReflection"
              (change)="updateNotificationSettings()"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Streak Notifications</label>
              <p class="text-xs text-gray-500 dark:text-gray-400">Celebrate your tracking streaks</p>
            </div>
            <input
              type="checkbox"
              [(ngModel)]="settings().notifications.streakNotifications"
              (change)="updateNotificationSettings()"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          
          @if (!notificationPermission()) {
            <div class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p class="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                Enable browser notifications to receive reminders
              </p>
              <button
                (click)="requestNotificationPermission()"
                class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
              >
                Enable Notifications
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Privacy Settings -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center space-x-2">
          <span class="text-2xl">🔒</span>
          <span>Privacy & Data</span>
        </h3>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Privacy Mode</label>
              <p class="text-xs text-gray-500 dark:text-gray-400">Hide sensitive information in previews</p>
            </div>
            <input
              type="checkbox"
              [(ngModel)]="settings().privacyMode"
              (change)="updateSettings()"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Retention (days)
            </label>
            <select
              [(ngModel)]="settings().dataRetention"
              (change)="updateSettings()"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">6 months</option>
              <option value="365">1 year</option>
              <option value="0">Keep forever</option>
            </select>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Automatically delete entries older than selected period
            </p>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center space-x-2">
          <span class="text-2xl">💾</span>
          <span>Data Management</span>
        </h3>
        
        <div class="space-y-4">
          <div class="flex flex-col space-y-4">
            <button
              (click)="exportData()"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Export Data as CSV
            </button>
          </div>
          
          @if (exportStatus()) {
            <div [class]="getExportStatusClass()" class="p-3 rounded-lg">
              <p class="text-sm font-medium">{{ exportStatus() }}</p>
            </div>
          }
          
          <div class="pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              (click)="clearAllData()"
              class="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Clear All Data
            </button>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              This action cannot be undone
            </p>
          </div>
        </div>
      </div>

      <!-- App Information -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center space-x-2">
          <span class="text-2xl">ℹ️</span>
          <span>About</span>
        </h3>
        
        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Version:</strong> 2.0.0</p>
          <p><strong>Total Entries:</strong> {{ moodStorageService.moodEntries().length }}</p>
          <p><strong>Gratitude Entries:</strong> {{ moodStorageService.gratitudeEntries().length }}</p>
          <p><strong>Data Storage:</strong> Local Browser Storage</p>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  public moodStorageService = inject(MoodStorageService);
  private notificationService = inject(NotificationService);
  
  settings = signal<AppSettings>(this.moodStorageService.settings());
  notificationPermission = signal<boolean>(false);
  exportStatus = signal<string>('');

  ngOnInit(): void {
    this.checkNotificationPermission();
  }

  private async checkNotificationPermission(): Promise<void> {
    this.notificationPermission.set(Notification.permission === 'granted');
  }

  async requestNotificationPermission(): Promise<void> {
    const granted = await this.notificationService.requestPermission();
    this.notificationPermission.set(granted);
    
    if (granted) {
      this.notificationService.scheduleReminder(this.settings().notifications);
    }
  }

  updateNotificationSettings(): void {
    this.updateSettings();
    
    if (this.settings().notifications.dailyReminder && this.notificationPermission()) {
      this.notificationService.scheduleReminder(this.settings().notifications);
    }
  }

  updateSettings(): void {
    this.moodStorageService.updateSettings(this.settings());
  }

  exportData(): void {
    const csvData = this.moodStorageService.exportDataAsCSV();
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `mood-tracker-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.exportStatus.set('Data exported successfully as CSV!');
    setTimeout(() => this.exportStatus.set(''), 3000);
  }

  clearAllData(): void {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      this.moodStorageService.clearAllEntries();
      this.exportStatus.set('All data cleared successfully.');
      setTimeout(() => this.exportStatus.set(''), 3000);
    }
  }

  getExportStatusClass(): string {
    const status = this.exportStatus();
    if (status.includes('successfully')) {
      return 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800';
    } else if (status.includes('Failed') || status.includes('Invalid')) {
      return 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800';
    }
    return 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800';
  }
}
import { Injectable, signal } from '@angular/core';
import { MoodEntry, MoodStats, GratitudeEntry, AppSettings, ExportData } from '../models/mood.interface';

@Injectable({
  providedIn: 'root'
})
export class MoodStorageService {
  private readonly STORAGE_KEY = 'mood-tracker-entries';
  private readonly GRATITUDE_KEY = 'mood-tracker-gratitude';
  private readonly SETTINGS_KEY = 'mood-tracker-settings';
  
  // Signals to track data
  moodEntries = signal<MoodEntry[]>([]);
  gratitudeEntries = signal<GratitudeEntry[]>([]);
  settings = signal<AppSettings>(this.getDefaultSettings());

  constructor() {
    this.loadAllData();
  }

  private getDefaultSettings(): AppSettings {
    return {
      darkMode: false, // Explicitly set to false for light mode default
      theme: 'default',
      notifications: {
        dailyReminder: true,
        reminderTime: '20:00',
        weeklyReflection: true,
        streakNotifications: true
      },
      dataRetention: 365,
      privacyMode: false,
      autoBackup: false
    };
  }

  private loadAllData(): void {
    this.loadMoodEntries();
    this.loadGratitudeEntries();
    this.loadSettings();
  }

  private loadMoodEntries(): void {
    try {
      const storedEntries = localStorage.getItem(this.STORAGE_KEY);
      if (storedEntries) {
        const entries = JSON.parse(storedEntries);
        this.moodEntries.set(entries);
      }
    } catch (error) {
      console.error('Error loading mood entries:', error);
      this.moodEntries.set([]);
    }
  }

  private loadGratitudeEntries(): void {
    try {
      const storedEntries = localStorage.getItem(this.GRATITUDE_KEY);
      if (storedEntries) {
        const entries = JSON.parse(storedEntries);
        this.gratitudeEntries.set(entries);
      }
    } catch (error) {
      console.error('Error loading gratitude entries:', error);
      this.gratitudeEntries.set([]);
    }
  }

  private loadSettings(): void {
    try {
      const storedSettings = localStorage.getItem(this.SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Merge with defaults to ensure all properties exist, but preserve stored values
        const settings = { 
          ...this.getDefaultSettings(), 
          ...parsedSettings,
          // Ensure darkMode is explicitly boolean
          darkMode: parsedSettings.darkMode === true
        };
        this.settings.set(settings);
      } else {
        // No stored settings, use defaults (light mode)
        this.settings.set(this.getDefaultSettings());
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings.set(this.getDefaultSettings());
    }
  }

  private saveMoodEntries(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.moodEntries()));
    } catch (error) {
      console.error('Error saving mood entries:', error);
    }
  }

  private saveGratitudeEntries(): void {
    try {
      localStorage.setItem(this.GRATITUDE_KEY, JSON.stringify(this.gratitudeEntries()));
    } catch (error) {
      console.error('Error saving gratitude entries:', error);
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings()));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  addMoodEntry(entry: Partial<MoodEntry>): void {
    const newEntry: MoodEntry = {
      id: this.generateId(),
      mood: entry.mood || '',
      note: entry.note || '',
      timestamp: new Date().toISOString(),
      intensity: entry.intensity || 5,
      energyLevel: entry.energyLevel || 5,
      sleepQuality: entry.sleepQuality,
      triggers: entry.triggers || [],
      activities: entry.activities || [],
      location: entry.location,
      weather: entry.weather,
      voiceNote: entry.voiceNote,
      photoUrl: entry.photoUrl
    };

    const currentEntries = this.moodEntries();
    this.moodEntries.set([newEntry, ...currentEntries]);
    this.saveMoodEntries();
  }

  addGratitudeEntry(text: string): void {
    const newEntry: GratitudeEntry = {
      id: this.generateId(),
      text,
      timestamp: new Date().toISOString()
    };

    const currentEntries = this.gratitudeEntries();
    this.gratitudeEntries.set([newEntry, ...currentEntries]);
    this.saveGratitudeEntries();
  }

  updateSettings(newSettings: Partial<AppSettings>): void {
    const currentSettings = this.settings();
    const updatedSettings = { 
      ...currentSettings, 
      ...newSettings,
      // Ensure darkMode is explicitly boolean
      darkMode: newSettings.darkMode === true
    };
    this.settings.set(updatedSettings);
    this.saveSettings();
  }

  getMoodStats(): MoodStats {
    const entries = this.moodEntries();
    if (entries.length === 0) {
      return {
        averageMood: 0,
        mostCommonMood: '',
        currentStreak: 0,
        longestStreak: 0,
        totalEntries: 0,
        weeklyTrend: 0
      };
    }

    // Calculate average mood score
    const moodScores = entries.map(entry => this.getMoodScore(entry.mood));
    const averageMood = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;

    // Find most common mood
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b
    );

    // Calculate streaks
    const { currentStreak, longestStreak } = this.calculateStreaks(entries);

    // Calculate weekly trend
    const weeklyTrend = this.calculateWeeklyTrend(entries);

    return {
      averageMood,
      mostCommonMood,
      currentStreak,
      longestStreak,
      totalEntries: entries.length,
      weeklyTrend
    };
  }

  private getMoodScore(mood: string): number {
    const moodScores: Record<string, number> = {
      'verysad': 1,
      'sad': 2,
      'neutral': 3,
      'okay': 4,
      'happy': 5
    };
    return moodScores[mood] || 3;
  }

  private calculateStreaks(entries: MoodEntry[]): { currentStreak: number; longestStreak: number } {
    if (entries.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = new Date();

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.timestamp);
      const daysDiff = Math.floor((lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 1) {
        tempStreak++;
        if (currentStreak === 0) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
        currentStreak = 0;
      }

      lastDate = entryDate;
    }

    longestStreak = Math.max(longestStreak, tempStreak);
    return { currentStreak, longestStreak };
  }

  private calculateWeeklyTrend(entries: MoodEntry[]): number {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekEntries = entries.filter(entry => 
      new Date(entry.timestamp) >= oneWeekAgo
    );
    const lastWeekEntries = entries.filter(entry => {
      const date = new Date(entry.timestamp);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    });

    if (thisWeekEntries.length === 0 || lastWeekEntries.length === 0) return 0;

    const thisWeekAvg = thisWeekEntries.reduce((sum, entry) => 
      sum + this.getMoodScore(entry.mood), 0
    ) / thisWeekEntries.length;

    const lastWeekAvg = lastWeekEntries.reduce((sum, entry) => 
      sum + this.getMoodScore(entry.mood), 0
    ) / lastWeekEntries.length;

    return thisWeekAvg - lastWeekAvg;
  }

  getEntriesByDateRange(startDate: Date, endDate: Date): MoodEntry[] {
    return this.moodEntries().filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  searchEntries(query: string): MoodEntry[] {
    const lowercaseQuery = query.toLowerCase();
    return this.moodEntries().filter(entry =>
      entry.note.toLowerCase().includes(lowercaseQuery) ||
      entry.triggers.some(trigger => trigger.toLowerCase().includes(lowercaseQuery)) ||
      entry.activities.some(activity => activity.toLowerCase().includes(lowercaseQuery))
    );
  }

  exportData(): ExportData {
    return {
      entries: this.moodEntries(),
      gratitude: this.gratitudeEntries(),
      settings: this.settings(),
      exportDate: new Date().toISOString(),
      version: '2.0.0'
    };
  }

  exportDataAsCSV(): string {
    const entries = this.moodEntries();
    const gratitude = this.gratitudeEntries();
    
    let csvContent = '';
    
    // Mood Entries CSV
    csvContent += 'MOOD ENTRIES\n';
    csvContent += 'Date,Time,Mood,Intensity,Energy Level,Sleep Quality,Note,Triggers,Activities\n';
    
    entries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      const triggers = entry.triggers.join('; ');
      const activities = entry.activities.join('; ');
      const sleepQuality = entry.sleepQuality || '';
      
      // Escape quotes and commas in text fields
      const escapeCsv = (text: string) => {
        if (text.includes(',') || text.includes('"') || text.includes('\n')) {
          return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
      };
      
      csvContent += `${dateStr},${timeStr},${entry.mood},${entry.intensity},${entry.energyLevel},${sleepQuality},${escapeCsv(entry.note)},${escapeCsv(triggers)},${escapeCsv(activities)}\n`;
    });
    
    // Add spacing
    csvContent += '\n\n';
    
    // Gratitude Entries CSV
    csvContent += 'GRATITUDE ENTRIES\n';
    csvContent += 'Date,Time,Gratitude Text\n';
    
    gratitude.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      
      const escapeCsv = (text: string) => {
        if (text.includes(',') || text.includes('"') || text.includes('\n')) {
          return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
      };
      
      csvContent += `${dateStr},${timeStr},${escapeCsv(entry.text)}\n`;
    });
    
    return csvContent;
  }

  importData(data: ExportData): boolean {
    try {
      if (data.entries) {
        this.moodEntries.set(data.entries);
        this.saveMoodEntries();
      }
      if (data.gratitude) {
        this.gratitudeEntries.set(data.gratitude);
        this.saveGratitudeEntries();
      }
      if (data.settings) {
        this.settings.set({ ...this.getDefaultSettings(), ...data.settings });
        this.saveSettings();
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  clearAllEntries(): void {
    this.moodEntries.set([]);
    this.gratitudeEntries.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.GRATITUDE_KEY);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
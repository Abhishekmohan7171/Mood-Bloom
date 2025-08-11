export interface MoodEntry {
  id: string;
  mood: string;
  note: string;
  timestamp: string;
  intensity: number;
  energyLevel: number;
  sleepQuality?: number | null;
  triggers: string[];
  activities: string[];
  location?: string;
  weather?: string;
  voiceNote?: string;
  photoUrl?: string;
}

export interface MoodOption {
  emoji: string;
  label: string;
  value: string;
  color: string;
  score: number;
}

export interface MoodStats {
  averageMood: number;
  mostCommonMood: string;
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  weeklyTrend: number;
}

export interface GratitudeEntry {
  id: string;
  text: string;
  timestamp: string;
}

export interface Affirmation {
  id: string;
  text: string;
  category: string;
}

export interface WellnessRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'breathing' | 'activity' | 'mindfulness' | 'gratitude';
  moodTrigger: string[];
}

export interface NotificationSettings {
  dailyReminder: boolean;
  reminderTime: string;
  weeklyReflection: boolean;
  streakNotifications: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  theme: string;
  notifications: NotificationSettings;
  dataRetention: number; // days
  privacyMode: boolean;
  autoBackup: boolean;
}

export interface ExportData {
  entries: MoodEntry[];
  gratitude: GratitudeEntry[];
  settings: AppSettings;
  exportDate: string;
  version: string;
}
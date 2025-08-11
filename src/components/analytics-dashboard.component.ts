import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoodStorageService } from '../services/mood-storage.service';
import { MoodStats, MoodEntry } from '../models/mood.interface';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Average Mood</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ stats().averageMood.toFixed(1) }}/5
              </p>
            </div>
            <div class="text-3xl">📊</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ stats().currentStreak }} days
              </p>
            </div>
            <div class="text-3xl">🔥</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entries</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ stats().totalEntries }}
              </p>
            </div>
            <div class="text-3xl">📝</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Weekly Trend</p>
              <p class="text-2xl font-bold" [class]="getTrendClass()">
                {{ getTrendText() }}
              </p>
            </div>
            <div class="text-3xl">{{ getTrendEmoji() }}</div>
          </div>
        </div>
      </div>

      <!-- Mood Distribution -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mood Distribution</h3>
        <div class="space-y-3">
          @for (mood of moodDistribution(); track mood.mood) {
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <span class="text-2xl">{{ mood.emoji }}</span>
                <span class="font-medium text-gray-700 dark:text-gray-300">{{ mood.label }}</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300"
                    [class]="mood.colorClass"
                    [style.width.%]="mood.percentage"
                  ></div>
                </div>
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 text-right">
                  {{ mood.percentage.toFixed(0) }}%
                </span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Recent Patterns -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">7-Day Mood Pattern</h3>
        <div class="grid grid-cols-7 gap-2">
          @for (day of weeklyPattern(); track day.date) {
            <div class="text-center">
              <div class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {{ day.dayName }}
              </div>
              <div 
                class="w-full h-12 rounded-lg flex items-center justify-center text-2xl transition-all duration-200 hover:scale-105"
                [class]="day.bgClass"
                [title]="day.tooltip"
              >
                {{ day.emoji }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ day.score.toFixed(1) }}
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Insights -->
      @if (insights().length > 0) {
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Insights</h3>
          <div class="space-y-3">
            @for (insight of insights(); track insight.id) {
              <div class="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div class="text-xl">💡</div>
                <p class="text-sm text-gray-700 dark:text-gray-300">{{ insight.text }}</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class AnalyticsDashboardComponent implements OnInit {
  private moodStorageService = inject(MoodStorageService);
  
  stats = signal<MoodStats>({
    averageMood: 0,
    mostCommonMood: '',
    currentStreak: 0,
    longestStreak: 0,
    totalEntries: 0,
    weeklyTrend: 0
  });

  moodDistribution = signal<any[]>([]);
  weeklyPattern = signal<any[]>([]);
  insights = signal<any[]>([]);

  private moodOptions = [
    { emoji: '😀', label: 'Happy', value: 'happy', score: 5, colorClass: 'bg-green-400' },
    { emoji: '🙂', label: 'Okay', value: 'okay', score: 4, colorClass: 'bg-yellow-400' },
    { emoji: '😐', label: 'Neutral', value: 'neutral', score: 3, colorClass: 'bg-gray-400' },
    { emoji: '🙁', label: 'Sad', value: 'sad', score: 2, colorClass: 'bg-orange-400' },
    { emoji: '😢', label: 'Very Sad', value: 'verysad', score: 1, colorClass: 'bg-red-400' }
  ];

  ngOnInit(): void {
    this.updateAnalytics();
  }

  private updateAnalytics(): void {
    const entries = this.moodStorageService.moodEntries();
    this.stats.set(this.moodStorageService.getMoodStats());
    this.calculateMoodDistribution(entries);
    this.calculateWeeklyPattern(entries);
    this.generateInsights(entries);
  }

  private calculateMoodDistribution(entries: MoodEntry[]): void {
    if (entries.length === 0) {
      this.moodDistribution.set([]);
      return;
    }

    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const distribution = this.moodOptions.map(option => ({
      ...option,
      count: moodCounts[option.value] || 0,
      percentage: ((moodCounts[option.value] || 0) / entries.length) * 100
    }));

    this.moodDistribution.set(distribution);
  }

  private calculateWeeklyPattern(entries: MoodEntry[]): void {
    const pattern = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayEntries = entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate.toDateString() === date.toDateString();
      });

      let avgScore = 3;
      let emoji = '😐';
      let bgClass = 'bg-gray-100 dark:bg-gray-700';

      if (dayEntries.length > 0) {
        const scores = dayEntries.map(entry => this.getMoodScore(entry.mood));
        avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        
        const moodOption = this.moodOptions.find(option => option.score === Math.round(avgScore));
        if (moodOption) {
          emoji = moodOption.emoji;
          bgClass = moodOption.colorClass.replace('bg-', 'bg-') + '/20';
        }
      }

      pattern.push({
        date: date.toISOString(),
        dayName: format(date, 'EEE'),
        score: avgScore,
        emoji,
        bgClass,
        tooltip: `${format(date, 'MMM d')}: ${avgScore.toFixed(1)}/5 (${dayEntries.length} entries)`
      });
    }

    this.weeklyPattern.set(pattern);
  }

  private generateInsights(entries: MoodEntry[]): void {
    const insights = [];
    const stats = this.stats();

    if (stats.currentStreak >= 7) {
      insights.push({
        id: 'streak',
        text: `Great job! You've been consistently tracking your mood for ${stats.currentStreak} days.`
      });
    }

    if (stats.weeklyTrend > 0.5) {
      insights.push({
        id: 'trend-up',
        text: 'Your mood has been trending upward this week compared to last week!'
      });
    } else if (stats.weeklyTrend < -0.5) {
      insights.push({
        id: 'trend-down',
        text: 'Your mood has been lower this week. Consider practicing some self-care activities.'
      });
    }

    if (stats.averageMood >= 4) {
      insights.push({
        id: 'positive',
        text: 'You\'ve been maintaining a positive mood overall. Keep up the great work!'
      });
    }

    this.insights.set(insights);
  }

  private getMoodScore(mood: string): number {
    const moodOption = this.moodOptions.find(option => option.value === mood);
    return moodOption ? moodOption.score : 3;
  }

  getTrendClass(): string {
    const trend = this.stats().weeklyTrend;
    if (trend > 0) return 'text-green-600 dark:text-green-400';
    if (trend < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  }

  getTrendText(): string {
    const trend = this.stats().weeklyTrend;
    if (trend > 0.5) return '+' + trend.toFixed(1);
    if (trend < -0.5) return trend.toFixed(1);
    return '0.0';
  }

  getTrendEmoji(): string {
    const trend = this.stats().weeklyTrend;
    if (trend > 0.5) return '📈';
    if (trend < -0.5) return '📉';
    return '➡️';
  }
}
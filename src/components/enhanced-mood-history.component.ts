import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MoodStorageService } from '../services/mood-storage.service';
import { MoodEntry } from '../models/mood.interface';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

@Component({
  selector: 'app-enhanced-mood-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white">Your Mood History</h3>
        
        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <!-- Search -->
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Search entries..."
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          
          <!-- Filter -->
          <select
            [(ngModel)]="selectedFilter"
            (change)="onFilterChange()"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Moods</option>
            <option value="happy">😀 Happy</option>
            <option value="okay">🙂 Okay</option>
            <option value="neutral">😐 Neutral</option>
            <option value="sad">🙁 Sad</option>
            <option value="verysad">😢 Very Sad</option>
          </select>
          
          <!-- Clear All Button -->
          <button
            (click)="clearAllEntries()"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 text-sm whitespace-nowrap"
          >
            Clear All
          </button>
        </div>
      </div>

      @if (filteredEntries().length > 0) {
        <div class="mood-history space-y-4 max-h-96 overflow-y-auto">
          @for (entry of filteredEntries(); track entry.id) {
            <div class="mood-entry p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-200 dark:border-gray-600">
              <div class="flex items-start space-x-4">
                <!-- Mood Indicator -->
                <div [class]="getMoodIndicatorClass(entry.mood)" class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                  {{ getMoodEmoji(entry.mood) }}
                </div>
                
                <!-- Entry Content -->
                <div class="flex-1 min-w-0">
                  <!-- Header with mood and timestamp -->
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <span class="font-semibold text-gray-900 dark:text-white">{{ getMoodLabel(entry.mood) }}</span>
                      @if (entry.intensity) {
                        <span class="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                          Intensity: {{ entry.intensity }}/10
                        </span>
                      }
                      @if (entry.energyLevel) {
                        <span class="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                          Energy: {{ entry.energyLevel }}/10
                        </span>
                      }
                    </div>
                    <button
                      (click)="toggleEntryDetails(entry.id)"
                      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    >
                      <svg class="w-5 h-5 transform transition-transform duration-200" 
                           [class.rotate-180]="expandedEntries().includes(entry.id)"
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                  </div>

                  <!-- Note -->
                  @if (entry.note) {
                    <p class="text-gray-700 dark:text-gray-300 mb-2 text-sm">{{ entry.note }}</p>
                  }

                  <!-- Timestamp -->
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatTimestamp(entry.timestamp) }}
                  </p>

                  <!-- Expanded Details -->
                  @if (expandedEntries().includes(entry.id)) {
                    <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2">
                      @if (entry.sleepQuality) {
                        <div class="flex items-center space-x-2">
                          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Sleep Quality:</span>
                          <span class="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                            {{ entry.sleepQuality }}/10
                          </span>
                        </div>
                      }

                      @if (entry.triggers && entry.triggers.length > 0) {
                        <div>
                          <span class="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Triggers:</span>
                          <div class="flex flex-wrap gap-1">
                            @for (trigger of entry.triggers; track trigger) {
                              <span class="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">
                                {{ trigger }}
                              </span>
                            }
                          </div>
                        </div>
                      }

                      @if (entry.activities && entry.activities.length > 0) {
                        <div>
                          <span class="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Activities:</span>
                          <div class="flex flex-wrap gap-1">
                            @for (activity of entry.activities; track activity) {
                              <span class="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full">
                                {{ activity }}
                              </span>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Load More Button -->
        @if (hasMoreEntries()) {
          <div class="text-center mt-4">
            <button
              (click)="loadMoreEntries()"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200"
            >
              Load More
            </button>
          </div>
        }
      } @else {
        <div class="text-center text-gray-500 dark:text-gray-400 py-8">
          @if (searchQuery() || selectedFilter() !== 'all') {
            <p class="text-lg">No entries match your search criteria.</p>
            <button
              (click)="clearFilters()"
              class="mt-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              Clear filters
            </button>
          } @else {
            <p class="text-lg">No mood entries yet.</p>
            <p class="text-sm">Start tracking your mood by selecting how you feel!</p>
          }
        </div>
      }
    </div>
  `
})
export class EnhancedMoodHistoryComponent implements OnInit {
  private moodStorageService = inject(MoodStorageService);
  
  searchQuery = signal<string>('');
  selectedFilter = signal<string>('all');
  expandedEntries = signal<string[]>([]);
  filteredEntries = signal<MoodEntry[]>([]);
  displayLimit = signal<number>(10);

  private moodOptions = [
    { emoji: '😀', label: 'Happy', value: 'happy' },
    { emoji: '🙂', label: 'Okay', value: 'okay' },
    { emoji: '😐', label: 'Neutral', value: 'neutral' },
    { emoji: '🙁', label: 'Sad', value: 'sad' },
    { emoji: '😢', label: 'Very Sad', value: 'verysad' }
  ];

  ngOnInit(): void {
    this.updateFilteredEntries();
  }

  onSearch(): void {
    this.updateFilteredEntries();
  }

  onFilterChange(): void {
    this.updateFilteredEntries();
  }

  private updateFilteredEntries(): void {
    let entries = this.moodStorageService.moodEntries();
    
    // Apply mood filter
    if (this.selectedFilter() !== 'all') {
      entries = entries.filter(entry => entry.mood === this.selectedFilter());
    }
    
    // Apply search filter
    if (this.searchQuery().trim()) {
      const query = this.searchQuery().toLowerCase();
      entries = entries.filter(entry =>
        entry.note.toLowerCase().includes(query) ||
        entry.triggers.some(trigger => trigger.toLowerCase().includes(query)) ||
        entry.activities.some(activity => activity.toLowerCase().includes(query))
      );
    }
    
    // Apply display limit
    const limitedEntries = entries.slice(0, this.displayLimit());
    this.filteredEntries.set(limitedEntries);
  }

  toggleEntryDetails(entryId: string): void {
    const expanded = this.expandedEntries();
    if (expanded.includes(entryId)) {
      this.expandedEntries.set(expanded.filter(id => id !== entryId));
    } else {
      this.expandedEntries.set([...expanded, entryId]);
    }
  }

  loadMoreEntries(): void {
    this.displayLimit.set(this.displayLimit() + 10);
    this.updateFilteredEntries();
  }

  hasMoreEntries(): boolean {
    let totalEntries = this.moodStorageService.moodEntries().length;
    
    // Apply filters to get actual count
    if (this.selectedFilter() !== 'all' || this.searchQuery().trim()) {
      let entries = this.moodStorageService.moodEntries();
      
      if (this.selectedFilter() !== 'all') {
        entries = entries.filter(entry => entry.mood === this.selectedFilter());
      }
      
      if (this.searchQuery().trim()) {
        const query = this.searchQuery().toLowerCase();
        entries = entries.filter(entry =>
          entry.note.toLowerCase().includes(query) ||
          entry.triggers.some(trigger => trigger.toLowerCase().includes(query)) ||
          entry.activities.some(activity => activity.toLowerCase().includes(query))
        );
      }
      
      totalEntries = entries.length;
    }
    
    return this.displayLimit() < totalEntries;
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedFilter.set('all');
    this.displayLimit.set(10);
    this.updateFilteredEntries();
  }

  clearAllEntries(): void {
    if (confirm('Are you sure you want to clear all mood entries? This action cannot be undone.')) {
      this.moodStorageService.clearAllEntries();
      this.updateFilteredEntries();
    }
  }

  getMoodLabel(moodValue: string): string {
    const mood = this.moodOptions.find(m => m.value === moodValue);
    return mood ? mood.label : '';
  }

  getMoodEmoji(moodValue: string): string {
    const mood = this.moodOptions.find(m => m.value === moodValue);
    return mood ? mood.emoji : '😐';
  }

  getMoodIndicatorClass(moodValue: string): string {
    const colorMap: { [key: string]: string } = {
      'happy': 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      'okay': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      'neutral': 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
      'sad': 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      'verysad': 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    };
    return colorMap[moodValue] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  }

  formatTimestamp(timestamp: string): string {
    const date = parseISO(timestamp);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, yyyy \'at\' HH:mm');
    }
  }
}
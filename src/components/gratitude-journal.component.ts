import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MoodStorageService } from '../services/mood-storage.service';
import { GratitudeEntry } from '../models/mood.interface';
import { format, parseISO } from 'date-fns';

@Component({
  selector: 'app-gratitude-journal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
          <span class="text-2xl">🙏</span>
          <span>Gratitude Journal</span>
        </h3>
      </div>

      <!-- Add Gratitude Form -->
      <div class="mb-6">
        <label for="gratitude" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          What are you grateful for today?
        </label>
        <div class="flex space-x-2">
          <textarea
            id="gratitude"
            [(ngModel)]="gratitudeText"
            placeholder="I'm grateful for..."
            maxlength="150"
            rows="2"
            class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          ></textarea>
          <button
            (click)="addGratitudeEntry()"
            [disabled]="!gratitudeText().trim()"
            [class]="getSubmitButtonClass()"
            class="px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 whitespace-nowrap"
          >
            Add
          </button>
        </div>
        <div class="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ gratitudeText().length }}/150
        </div>
      </div>

      <!-- Gratitude Entries -->
      @if (moodStorageService.gratitudeEntries().length > 0) {
        <div class="space-y-3 max-h-64 overflow-y-auto">
          @for (entry of moodStorageService.gratitudeEntries(); track entry.id) {
            <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <p class="text-gray-800 dark:text-gray-200 mb-2">{{ entry.text }}</p>
              <p class="text-xs text-amber-600 dark:text-amber-400">
                {{ formatTimestamp(entry.timestamp) }}
              </p>
            </div>
          }
        </div>
      } @else {
        <div class="text-center text-gray-500 dark:text-gray-400 py-8">
          <div class="text-4xl mb-2">🌟</div>
          <p class="text-lg">Start your gratitude practice</p>
          <p class="text-sm">Write down something you're thankful for today</p>
        </div>
      }
    </div>
  `
})
export class GratitudeJournalComponent {
  moodStorageService = inject(MoodStorageService);
  
  gratitudeText = signal<string>('');

  addGratitudeEntry(): void {
    const text = this.gratitudeText().trim();
    if (text) {
      this.moodStorageService.addGratitudeEntry(text);
      this.gratitudeText.set('');
    }
  }

  getSubmitButtonClass(): string {
    const hasText = this.gratitudeText().trim();
    return hasText 
      ? 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500'
      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed';
  }

  formatTimestamp(timestamp: string): string {
    const date = parseISO(timestamp);
    return format(date, 'MMM d, yyyy \'at\' HH:mm');
  }
}
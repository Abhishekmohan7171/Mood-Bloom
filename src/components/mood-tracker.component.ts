import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MoodStorageService } from '../services/mood-storage.service';
import { MoodOption, MoodEntry } from '../models/mood.interface';

@Component({
  selector: 'app-mood-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 space-y-8">
      <!-- Mood Entry Form -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">How are you feeling today?</h2>
        
        <!-- Mood Selector -->
        <div class="mb-6">
          <div class="flex justify-center space-x-4 mb-4">
            @for (moodOption of moodOptions; track moodOption.value) {
              <button
                type="button"
                (click)="selectMood(moodOption.value)"
                [class]="getMoodButtonClass(moodOption.value, moodOption.color)"
                class="p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-opacity-50"
                [title]="moodOption.label"
              >
                <span class="text-4xl">{{ moodOption.emoji }}</span>
              </button>
            }
          </div>
          @if (selectedMood()) {
            <p class="text-center text-gray-600 font-medium">
              Selected: {{ getMoodLabel(selectedMood()) }}
            </p>
          }
        </div>

        <!-- Note Input -->
        <div class="mb-6">
          <label for="note" class="block text-sm font-medium text-gray-700 mb-2">
            Add a note (optional)
          </label>
          <textarea
            id="note"
            [(ngModel)]="noteText"
            placeholder="What's on your mind? (max 100 characters)"
            maxlength="100"
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
          ></textarea>
          <div class="text-right text-sm text-gray-500 mt-1">
            {{ noteText().length }}/100
          </div>
        </div>

        <!-- Submit Button -->
        <button
          (click)="submitMood()"
          [disabled]="!selectedMood()"
          [class]="getSubmitButtonClass()"
          class="w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50"
        >
          {{ submitButtonText() }}
        </button>

        @if (showValidationError()) {
          <p class="text-red-500 text-sm text-center mt-2">
            Please select a mood before submitting.
          </p>
        }
      </div>

      <!-- Mood History -->
      @if (moodStorageService.moodEntries().length > 0) {
        <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-800">Your Mood History</h3>
            <button
              (click)="clearAllEntries()"
              class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Clear All
            </button>
          </div>

          <div class="mood-history space-y-4 max-h-96 overflow-y-auto">
            @for (entry of moodStorageService.moodEntries(); track entry.id) {
              <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div [class]="getMoodIndicatorClass(entry.mood)" class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                  {{ getMoodEmoji(entry.mood) }}
                </div>
                <div class="flex-1 min-w-0">
                  @if (entry.note) {
                    <p class="text-gray-800 font-medium mb-1">{{ entry.note }}</p>
                  }
                  <p class="text-sm text-gray-500">
                    {{ formatTimestamp(entry.timestamp) }}
                  </p>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="text-center text-gray-500 py-8">
          <p class="text-lg">No mood entries yet.</p>
          <p class="text-sm">Start tracking your mood by selecting how you feel!</p>
        </div>
      }
    </div>
  `
})
export class MoodTrackerComponent {
  moodStorageService = inject(MoodStorageService);
  
  selectedMood = signal<string>('');
  noteText = signal<string>('');
  showValidationError = signal<boolean>(false);

  moodOptions: MoodOption[] = [
    { emoji: '😀', label: 'Happy', value: 'happy', color: 'mood-happy' },
    { emoji: '🙂', label: 'Okay', value: 'okay', color: 'mood-okay' },
    { emoji: '😐', label: 'Neutral', value: 'neutral', color: 'mood-neutral' },
    { emoji: '🙁', label: 'Sad', value: 'sad', color: 'mood-sad' },
    { emoji: '😢', label: 'Very Sad', value: 'verysad', color: 'mood-verysad' }
  ];

  selectMood(mood: string): void {
    this.selectedMood.set(mood);
    this.showValidationError.set(false);
  }

  submitMood(): void {
    if (!this.selectedMood()) {
      this.showValidationError.set(true);
      return;
    }

    this.moodStorageService.addMoodEntry(this.selectedMood(), this.noteText());
    
    // Reset form
    this.selectedMood.set('');
    this.noteText.set('');
    this.showValidationError.set(false);
  }

  clearAllEntries(): void {
    if (confirm('Are you sure you want to clear all mood entries? This action cannot be undone.')) {
      this.moodStorageService.clearAllEntries();
    }
  }

  getMoodButtonClass(moodValue: string, colorClass: string): string {
    const baseClass = 'border-2';
    const isSelected = this.selectedMood() === moodValue;
    
    const colorMap: { [key: string]: string } = {
      'mood-happy': isSelected ? 'bg-green-100 border-green-400 ring-green-400' : 'border-green-200 hover:border-green-300 hover:bg-green-50',
      'mood-okay': isSelected ? 'bg-yellow-100 border-yellow-400 ring-yellow-400' : 'border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50',
      'mood-neutral': isSelected ? 'bg-gray-100 border-gray-400 ring-gray-400' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
      'mood-sad': isSelected ? 'bg-orange-100 border-orange-400 ring-orange-400' : 'border-orange-200 hover:border-orange-300 hover:bg-orange-50',
      'mood-verysad': isSelected ? 'bg-red-100 border-red-400 ring-red-400' : 'border-red-200 hover:border-red-300 hover:bg-red-50'
    };

    return `${baseClass} ${colorMap[colorClass] || ''}`;
  }

  getSubmitButtonClass(): string {
    const hasSelectedMood = this.selectedMood();
    return hasSelectedMood 
      ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed';
  }

  submitButtonText(): string {
    return this.selectedMood() ? 'Record Mood' : 'Select a mood first';
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
      'happy': 'bg-green-100 text-green-600',
      'okay': 'bg-yellow-100 text-yellow-600',
      'neutral': 'bg-gray-100 text-gray-600',
      'sad': 'bg-orange-100 text-orange-600',
      'verysad': 'bg-red-100 text-red-600'
    };
    return colorMap[moodValue] || 'bg-gray-100 text-gray-600';
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
}
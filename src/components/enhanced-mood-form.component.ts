import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MoodStorageService } from '../services/mood-storage.service';
import { WellnessService } from '../services/wellness.service';
import { MoodOption, WellnessRecommendation } from '../models/mood.interface';

@Component({
  selector: 'app-enhanced-mood-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8 border border-gray-100 dark:border-gray-700">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white text-center mb-4 sm:mb-6">
        How are you feeling today?
      </h2>
      
      <!-- Mood Selector -->
      <div class="mb-4 sm:mb-6">
        <div class="flex justify-center flex-wrap gap-2 sm:gap-4 mb-4 px-2">
          @for (moodOption of moodOptions; track moodOption.value) {
            <button
              type="button"
              (click)="selectMood(moodOption.value)"
              [class]="getMoodButtonClass(moodOption.value, moodOption.color)"
              class="p-2 sm:p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-opacity-50 border-2 min-w-[60px] sm:min-w-[80px]"
              [title]="moodOption.label"
            >
              <span class="text-2xl sm:text-4xl">{{ moodOption.emoji }}</span>
            </button>
          }
        </div>
        @if (selectedMood()) {
          <p class="text-center text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">
            Selected: {{ getMoodLabel(selectedMood()) }}
          </p>
        }
      </div>

      <!-- Intensity Scale -->
      @if (selectedMood()) {
        <div class="mb-4 sm:mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Intensity Level: {{ intensity() }}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            [(ngModel)]="intensity"
            class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Mild</span>
            <span>Intense</span>
          </div>
        </div>

        <!-- Energy Level -->
        <div class="mb-4 sm:mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Energy Level: {{ energyLevel() }}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            [(ngModel)]="energyLevel"
            class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Drained</span>
            <span>Energized</span>
          </div>
        </div>

        <!-- Sleep Quality -->
        <div class="mb-4 sm:mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sleep Quality (optional): {{ sleepQuality() || 'Not set' }}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            [(ngModel)]="sleepQuality"
            class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>
      }

      <!-- Triggers -->
      <div class="mb-4 sm:mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          What triggered this mood? (optional)
        </label>
        <div class="flex flex-wrap gap-1 sm:gap-2 mb-2">
          @for (trigger of commonTriggers; track trigger) {
            <button
              type="button"
              (click)="toggleTrigger(trigger)"
              [class]="getTriggerButtonClass(trigger)"
              class="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200"
            >
              {{ trigger }}
            </button>
          }
        </div>
        <input
          type="text"
          [(ngModel)]="customTrigger"
          (keyup.enter)="addCustomTrigger()"
          placeholder="Add custom trigger..."
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <!-- Activities -->
      <div class="mb-4 sm:mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          What activities were you doing? (optional)
        </label>
        <div class="flex flex-wrap gap-1 sm:gap-2 mb-2">
          @for (activity of commonActivities; track activity) {
            <button
              type="button"
              (click)="toggleActivity(activity)"
              [class]="getActivityButtonClass(activity)"
              class="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200"
            >
              {{ activity }}
            </button>
          }
        </div>
        <input
          type="text"
          [(ngModel)]="customActivity"
          (keyup.enter)="addCustomActivity()"
          placeholder="Add custom activity..."
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <!-- Note Input -->
      <div class="mb-4 sm:mb-6">
        <label for="note" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Add a note (optional)
        </label>
        <textarea
          id="note"
          [(ngModel)]="noteText"
          placeholder="What's on your mind? (max 200 characters)"
          maxlength="200"
          rows="3"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        ></textarea>
        <div class="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ noteText().length }}/200
        </div>
      </div>

      <!-- Submit Button -->
      <button
        (click)="submitMood()"
        [disabled]="!selectedMood()"
        [class]="getSubmitButtonClass()"
        class="w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 text-sm sm:text-base"
      >
        {{ submitButtonText() }}
      </button>

      @if (showValidationError()) {
        <p class="text-red-500 text-sm text-center mt-2">
          Please select a mood before submitting.
        </p>
      }

      <!-- Wellness Recommendations -->
      @if (selectedMood() && recommendations().length > 0) {
        <div class="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <h3 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💡 Wellness Suggestions
          </h3>
          <div class="space-y-2">
            @for (rec of recommendations(); track rec.id) {
              <div class="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                <strong>{{ rec.title }}:</strong> {{ rec.description }}
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class EnhancedMoodFormComponent implements OnInit {
  private moodStorageService = inject(MoodStorageService);
  private wellnessService = inject(WellnessService);
  
  selectedMood = signal<string>('');
  noteText = signal<string>('');
  intensity = signal<number>(5);
  energyLevel = signal<number>(5);
  sleepQuality = signal<number | null>(null);
  selectedTriggers = signal<string[]>([]);
  selectedActivities = signal<string[]>([]);
  customTrigger = signal<string>('');
  customActivity = signal<string>('');
  showValidationError = signal<boolean>(false);
  recommendations = signal<WellnessRecommendation[]>([]);

  moodOptions: MoodOption[] = [
    { emoji: '😀', label: 'Happy', value: 'happy', color: 'mood-happy', score: 5 },
    { emoji: '🙂', label: 'Okay', value: 'okay', color: 'mood-okay', score: 4 },
    { emoji: '😐', label: 'Neutral', value: 'neutral', color: 'mood-neutral', score: 3 },
    { emoji: '🙁', label: 'Sad', value: 'sad', color: 'mood-sad', score: 2 },
    { emoji: '😢', label: 'Very Sad', value: 'verysad', color: 'mood-verysad', score: 1 }
  ];

  commonTriggers = [
    'Work stress', 'Relationship', 'Health', 'Money', 'Family', 'Weather',
    'Social media', 'News', 'Traffic', 'Lack of sleep', 'Exercise', 'Food'
  ];

  commonActivities = [
    'Working', 'Exercising', 'Socializing', 'Reading', 'Watching TV', 'Cooking',
    'Shopping', 'Traveling', 'Gaming', 'Music', 'Art', 'Meditation'
  ];

  ngOnInit(): void {
    // Initialize with default values
  }

  selectMood(mood: string): void {
    this.selectedMood.set(mood);
    this.showValidationError.set(false);
    this.updateRecommendations(mood);
  }

  private updateRecommendations(mood: string): void {
    const recs = this.wellnessService.getRecommendationsForMood(mood);
    this.recommendations.set(recs.slice(0, 2)); // Show only first 2 recommendations
  }

  toggleTrigger(trigger: string): void {
    const current = this.selectedTriggers();
    if (current.includes(trigger)) {
      this.selectedTriggers.set(current.filter(t => t !== trigger));
    } else {
      this.selectedTriggers.set([...current, trigger]);
    }
  }

  toggleActivity(activity: string): void {
    const current = this.selectedActivities();
    if (current.includes(activity)) {
      this.selectedActivities.set(current.filter(a => a !== activity));
    } else {
      this.selectedActivities.set([...current, activity]);
    }
  }

  addCustomTrigger(): void {
    const trigger = this.customTrigger().trim();
    if (trigger && !this.selectedTriggers().includes(trigger)) {
      this.selectedTriggers.set([...this.selectedTriggers(), trigger]);
      this.customTrigger.set('');
    }
  }

  addCustomActivity(): void {
    const activity = this.customActivity().trim();
    if (activity && !this.selectedActivities().includes(activity)) {
      this.selectedActivities.set([...this.selectedActivities(), activity]);
      this.customActivity.set('');
    }
  }

  submitMood(): void {
    if (!this.selectedMood()) {
      this.showValidationError.set(true);
      return;
    }

    this.moodStorageService.addMoodEntry({
      mood: this.selectedMood(),
      note: this.noteText(),
      intensity: this.intensity(),
      energyLevel: this.energyLevel(),
      sleepQuality: this.sleepQuality(),
      triggers: this.selectedTriggers(),
      activities: this.selectedActivities()
    });
    
    // Reset form
    this.resetForm();
  }

  private resetForm(): void {
    this.selectedMood.set('');
    this.noteText.set('');
    this.intensity.set(5);
    this.energyLevel.set(5);
    this.sleepQuality.set(null);
    this.selectedTriggers.set([]);
    this.selectedActivities.set([]);
    this.customTrigger.set('');
    this.customActivity.set('');
    this.showValidationError.set(false);
    this.recommendations.set([]);
  }

  getMoodButtonClass(moodValue: string, colorClass: string): string {
    const baseClass = '';
    const isSelected = this.selectedMood() === moodValue;
    
    const colorMap: { [key: string]: string } = {
      'mood-happy': isSelected ? 'bg-green-100 dark:bg-green-900/30 border-green-400 ring-green-400' : 'border-green-200 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20',
      'mood-okay': isSelected ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 ring-yellow-400' : 'border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
      'mood-neutral': isSelected ? 'bg-gray-100 dark:bg-gray-700 border-gray-400 ring-gray-400' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
      'mood-sad': isSelected ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-400 ring-orange-400' : 'border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20',
      'mood-verysad': isSelected ? 'bg-red-100 dark:bg-red-900/30 border-red-400 ring-red-400' : 'border-red-200 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
    };

    return `${baseClass} ${colorMap[colorClass] || ''}`;
  }

  getTriggerButtonClass(trigger: string): string {
    const isSelected = this.selectedTriggers().includes(trigger);
    return isSelected 
      ? 'bg-blue-500 text-white' 
      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600';
  }

  getActivityButtonClass(activity: string): string {
    const isSelected = this.selectedActivities().includes(activity);
    return isSelected 
      ? 'bg-purple-500 text-white' 
      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600';
  }

  getSubmitButtonClass(): string {
    const hasSelectedMood = this.selectedMood();
    return hasSelectedMood 
      ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500'
      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed';
  }

  submitButtonText(): string {
    return this.selectedMood() ? 'Record Mood' : 'Select a mood first';
  }

  getMoodLabel(moodValue: string): string {
    const mood = this.moodOptions.find(m => m.value === moodValue);
    return mood ? mood.label : '';
  }
}
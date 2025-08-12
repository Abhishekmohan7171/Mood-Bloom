import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WellnessService } from '../services/wellness.service';
import { MoodStorageService } from '../services/mood-storage.service';
import { Affirmation, WellnessRecommendation } from '../models/mood.interface';

@Component({
  selector: 'app-wellness-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Daily Affirmation -->
      <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 text-white">
        <div class="text-center">
          <h3 class="text-xl font-bold mb-4 flex items-center justify-center space-x-2">
            <span class="text-2xl">✨</span>
            <span>Daily Affirmation</span>
          </h3>
          <p class="text-lg font-medium mb-4 italic">
            "{{ dailyAffirmation().text }}"
          </p>
          <button
            (click)="getNewAffirmation()"
            class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            New Affirmation
          </button>
        </div>
      </div>

      <!-- Breathing Exercise -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
          <span class="text-2xl">🫁</span>
          <span>Breathing Exercise</span>
        </h3>
        
        @if (!breathingActive()) {
          <div class="text-center">
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Take a moment to practice deep breathing. This can help reduce stress and improve your mood.
            </p>
            <button
              (click)="startBreathingExercise()"
              class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
            >
              Start Breathing Exercise
            </button>
          </div>
        } @else {
          <div class="text-center">
            <div class="mb-6">
              <div 
                class="w-32 h-32 mx-auto rounded-full border-4 border-blue-500 flex items-center justify-center text-2xl font-bold text-blue-500 transition-all duration-1000"
                [class.scale-125]="breathingPhase() === 'inhale'"
                [class.scale-75]="breathingPhase() === 'exhale'"
              >
                {{ breathingCount() }}
              </div>
            </div>
            
            <p class="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {{ breathingInstruction() }}
            </p>
            
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Round {{ currentRound() }} of {{ totalRounds() }}
            </p>
            
            <button
              (click)="stopBreathingExercise()"
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Stop Exercise
            </button>
          </div>
        }
      </div>

      <!-- Mood-Based Recommendations -->
      @if (recommendations().length > 0) {
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
            <span class="text-2xl">💡</span>
            <span>Wellness Recommendations</span>
          </h3>
          
          <div class="grid gap-4">
            @for (rec of recommendations(); track rec.id) {
              <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 class="font-semibold text-blue-800 dark:text-blue-200 mb-2">{{ rec.title }}</h4>
                <p class="text-blue-700 dark:text-blue-300 text-sm">{{ rec.description }}</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- Mental Health Resources -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
          <span class="text-2xl">🆘</span>
          <span>Mental Health Resources</span>
        </h3>
        
        <div class="space-y-4">
          <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <h4 class="font-semibold text-red-800 dark:text-red-200 mb-2">Crisis Support</h4>
            <p class="text-red-700 dark:text-red-300 text-sm mb-2">
              If you're having thoughts of self-harm or suicide, please reach out for help immediately.
            </p>
            <div class="space-y-1 text-sm">
              <p class="text-red-700 dark:text-red-300">
                <strong>National Suicide Prevention Lifeline:</strong> 988
              </p>
              <p class="text-red-700 dark:text-red-300">
                <strong>AASRA (24x7 Helpline):</strong> +91-9820466726
              </p>
            </div>
          </div>
          
          <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <h4 class="font-semibold text-green-800 dark:text-green-200 mb-2">Professional Help</h4>
            <p class="text-green-700 dark:text-green-300 text-sm">
              Consider speaking with a mental health professional if you're experiencing persistent mood changes or emotional difficulties.
            </p>
          </div>
          
          <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <h4 class="font-semibold text-purple-800 dark:text-purple-200 mb-2">Self-Care Tips</h4>
            <ul class="text-purple-700 dark:text-purple-300 text-sm space-y-1">
              <li>• Maintain a regular sleep schedule</li>
              <li>• Stay physically active</li>
              <li>• Connect with friends and family</li>
              <li>• Practice mindfulness or meditation</li>
              <li>• Limit alcohol and avoid drugs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WellnessCenterComponent implements OnInit {
  private wellnessService = inject(WellnessService);
  private moodStorageService = inject(MoodStorageService);
  
  dailyAffirmation = signal<Affirmation>({ id: '', text: '', category: '' });
  recommendations = signal<WellnessRecommendation[]>([]);
  
  // Breathing exercise state
  breathingActive = signal<boolean>(false);
  breathingPhase = signal<'inhale' | 'hold' | 'exhale'>('inhale');
  breathingCount = signal<number>(4);
  breathingInstruction = signal<string>('');
  currentRound = signal<number>(1);
  totalRounds = signal<number>(5);
  
  private breathingTimer?: number;

  ngOnInit(): void {
    this.getNewAffirmation();
    this.loadRecommendations();
  }

  getNewAffirmation(): void {
    const affirmation = this.wellnessService.getRandomAffirmation();
    this.dailyAffirmation.set(affirmation);
  }

  private loadRecommendations(): void {
    const recentEntries = this.moodStorageService.moodEntries().slice(0, 5);
    if (recentEntries.length > 0) {
      const recentMood = recentEntries[0].mood;
      const recs = this.wellnessService.getRecommendationsForMood(recentMood);
      this.recommendations.set(recs.slice(0, 3));
    }
  }

  startBreathingExercise(): void {
    this.breathingActive.set(true);
    this.currentRound.set(1);
    this.startBreathingCycle();
  }

  stopBreathingExercise(): void {
    this.breathingActive.set(false);
    if (this.breathingTimer) {
      clearTimeout(this.breathingTimer);
    }
    this.resetBreathingState();
  }

  private startBreathingCycle(): void {
    this.breathingPhase.set('inhale');
    this.breathingInstruction.set('Breathe in slowly...');
    this.startCountdown(4, () => {
      this.breathingPhase.set('hold');
      this.breathingInstruction.set('Hold your breath...');
      this.startCountdown(4, () => {
        this.breathingPhase.set('exhale');
        this.breathingInstruction.set('Breathe out slowly...');
        this.startCountdown(6, () => {
          if (this.currentRound() < this.totalRounds()) {
            this.currentRound.set(this.currentRound() + 1);
            this.startBreathingCycle();
          } else {
            this.completeBreathingExercise();
          }
        });
      });
    });
  }

  private startCountdown(seconds: number, callback: () => void): void {
    this.breathingCount.set(seconds);
    
    const countdown = () => {
      const current = this.breathingCount();
      if (current > 1) {
        this.breathingCount.set(current - 1);
        this.breathingTimer = window.setTimeout(countdown, 1000);
      } else {
        callback();
      }
    };
    
    this.breathingTimer = window.setTimeout(countdown, 1000);
  }

  private completeBreathingExercise(): void {
    this.breathingActive.set(false);
    this.breathingInstruction.set('Great job! You completed the breathing exercise.');
    
    // Reset after showing completion message
    setTimeout(() => {
      this.resetBreathingState();
    }, 3000);
  }

  private resetBreathingState(): void {
    this.breathingPhase.set('inhale');
    this.breathingCount.set(4);
    this.breathingInstruction.set('');
    this.currentRound.set(1);
  }
}
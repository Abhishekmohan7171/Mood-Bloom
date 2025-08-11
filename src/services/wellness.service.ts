import { Injectable } from '@angular/core';
import { WellnessRecommendation, Affirmation } from '../models/mood.interface';

@Injectable({
  providedIn: 'root'
})
export class WellnessService {
  private affirmations: Affirmation[] = [
    { id: '1', text: 'I am worthy of love and happiness', category: 'self-love' },
    { id: '2', text: 'This feeling is temporary and will pass', category: 'resilience' },
    { id: '3', text: 'I have overcome challenges before and I can do it again', category: 'strength' },
    { id: '4', text: 'I choose to focus on what I can control', category: 'mindfulness' },
    { id: '5', text: 'I am grateful for the good things in my life', category: 'gratitude' },
    { id: '6', text: 'I deserve to take care of myself', category: 'self-care' },
    { id: '7', text: 'Every day is a new opportunity to grow', category: 'growth' },
    { id: '8', text: 'I am enough, just as I am', category: 'self-acceptance' }
  ];

  private recommendations: WellnessRecommendation[] = [
    {
      id: '1',
      title: 'Deep Breathing Exercise',
      description: 'Take 5 deep breaths, inhaling for 4 counts and exhaling for 6 counts',
      type: 'breathing',
      moodTrigger: ['sad', 'verysad', 'neutral']
    },
    {
      id: '2',
      title: 'Take a Walk',
      description: 'A 10-minute walk can boost your mood and energy levels',
      type: 'activity',
      moodTrigger: ['sad', 'neutral']
    },
    {
      id: '3',
      title: 'Practice Gratitude',
      description: 'Write down 3 things you\'re grateful for today',
      type: 'gratitude',
      moodTrigger: ['sad', 'verysad', 'neutral']
    },
    {
      id: '4',
      title: 'Mindful Moment',
      description: 'Take 2 minutes to focus on your surroundings using your 5 senses',
      type: 'mindfulness',
      moodTrigger: ['sad', 'verysad', 'neutral']
    },
    {
      id: '5',
      title: 'Listen to Music',
      description: 'Play your favorite uplifting song and really listen to it',
      type: 'activity',
      moodTrigger: ['sad', 'neutral']
    },
    {
      id: '6',
      title: 'Progressive Muscle Relaxation',
      description: 'Tense and release each muscle group for 5 seconds',
      type: 'breathing',
      moodTrigger: ['sad', 'verysad']
    }
  ];

  getRecommendationsForMood(mood: string): WellnessRecommendation[] {
    return this.recommendations.filter(rec => 
      rec.moodTrigger.includes(mood)
    );
  }

  getRandomAffirmation(): Affirmation {
    const randomIndex = Math.floor(Math.random() * this.affirmations.length);
    return this.affirmations[randomIndex];
  }

  getAffirmationsByCategory(category: string): Affirmation[] {
    return this.affirmations.filter(aff => aff.category === category);
  }

  getAllAffirmations(): Affirmation[] {
    return this.affirmations;
  }

  getAllRecommendations(): WellnessRecommendation[] {
    return this.recommendations;
  }
}
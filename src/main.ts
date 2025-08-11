import { Component, signal, OnInit, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { EnhancedMoodFormComponent } from './components/enhanced-mood-form.component';
import { EnhancedMoodHistoryComponent } from './components/enhanced-mood-history.component';
import { AnalyticsDashboardComponent } from './components/analytics-dashboard.component';
import { GratitudeJournalComponent } from './components/gratitude-journal.component';
import { WellnessCenterComponent } from './components/wellness-center.component';
import { SettingsComponent } from './components/settings.component';
import { MoodStorageService } from './services/mood-storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    EnhancedMoodFormComponent,
    EnhancedMoodHistoryComponent,
    AnalyticsDashboardComponent,
    GratitudeJournalComponent,
    WellnessCenterComponent,
    SettingsComponent
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors duration-300">
      <!-- Header -->
      <header class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-3 sm:py-4">
            <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <span class="text-2xl sm:text-3xl lg:text-4xl">🌸</span>
              <span>Mood Bloom</span>
            </h1>
            
            <!-- Navigation -->
            <nav class="hidden md:flex space-x-1">
              @for (tab of tabs; track tab.id) {
                <button
                  (click)="setActiveTab(tab.id)"
                  [class]="getTabClass(tab.id)"
                  class="px-3 lg:px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm lg:text-base"
                >
                  <span class="mr-1 lg:mr-2">{{ tab.icon }}</span>
                  <span class="hidden lg:inline">{{ tab.label }}</span>
                </button>
              }
            </nav>
            
            <!-- Mobile Menu Button -->
            <button
              (click)="toggleMobileMenu()"
              class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
          
          <!-- Mobile Navigation -->
          @if (showMobileMenu()) {
            <div class="md:hidden pb-4 border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
              <div class="grid grid-cols-2 gap-2">
                @for (tab of tabs; track tab.id) {
                  <button
                    (click)="setActiveTab(tab.id); toggleMobileMenu()"
                    [class]="getTabClass(tab.id)"
                    class="px-3 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm"
                  >
                    <span class="mr-1">{{ tab.icon }}</span>
                    {{ tab.label }}
                  </button>
                }
              </div>
            </div>
          }
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        @switch (activeTab()) {
          @case ('track') {
            <div class="max-w-2xl mx-auto">
              <app-enhanced-mood-form></app-enhanced-mood-form>
            </div>
          }
          @case ('history') {
            <div class="max-w-4xl mx-auto">
              <app-enhanced-mood-history></app-enhanced-mood-history>
            </div>
          }
          @case ('analytics') {
            <div class="max-w-6xl mx-auto">
              <app-analytics-dashboard></app-analytics-dashboard>
            </div>
          }
          @case ('gratitude') {
            <div class="max-w-2xl mx-auto">
              <app-gratitude-journal></app-gratitude-journal>
            </div>
          }
          @case ('wellness') {
            <div class="max-w-4xl mx-auto">
              <app-wellness-center></app-wellness-center>
            </div>
          }
          @case ('settings') {
            <div class="max-w-4xl mx-auto">
              <app-settings></app-settings>
            </div>
          }
        }
      </main>

      <!-- Footer -->
      <footer class="text-center text-gray-500 dark:text-gray-400 text-sm py-6 sm:py-8 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <p>Track your daily moods and reflect on your emotional journey</p>
        <p class="mt-1">Your mental wellness matters ❤️</p>
      </footer>
    </div>
  `
})
export class App implements OnInit {
  private moodStorageService = inject(MoodStorageService);
  
  activeTab = signal<string>('track');
  showMobileMenu = signal<boolean>(false);

  tabs = [
    { id: 'track', label: 'Track', icon: '📝' },
    { id: 'history', label: 'History', icon: '📚' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'gratitude', label: 'Gratitude', icon: '🙏' },
    { id: 'wellness', label: 'Wellness', icon: '🧘' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  ngOnInit(): void {
    // Theme is already initialized in index.html script
    // Just ensure the service is in sync
    this.syncThemeWithService();
  }

  private syncThemeWithService(): void {
    const settings = this.moodStorageService.settings();
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // If there's a mismatch, update the service to match the DOM
    if (settings.darkMode !== isDarkMode) {
      this.moodStorageService.updateSettings({ darkMode: isDarkMode });
    }
  }

  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.set(!this.showMobileMenu());
  }

  getTabClass(tabId: string): string {
    const isActive = this.activeTab() === tabId;
    return isActive
      ? 'bg-blue-500 text-white shadow-lg'
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white';
  }
}

bootstrapApplication(App);
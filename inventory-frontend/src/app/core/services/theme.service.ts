import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ColorScheme {
  id: string;
  name: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public readonly availableSchemes: ColorScheme[] = [
    { id: 'sunset', name: 'Sunset (Default)', color: '#d2593b' },
    { id: 'ocean', name: 'Ocean Blue', color: '#0ea5e9' },
    { id: 'emerald', name: 'Emerald Green', color: '#10b981' },
    { id: 'amethyst', name: 'Amethyst Purple', color: '#8b5cf6' },
    { id: 'ruby', name: 'Ruby Red', color: '#ef4444' },
    { id: 'amber', name: 'Golden Amber', color: '#f59e0b' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', color: '#06b6d4' },
    { id: 'midnight', name: 'Midnight Indigo', color: '#6366f1' },
    { id: 'rose', name: 'Rose Gold', color: '#f43f5e' },
    { id: 'slate', name: 'Slate Chrome', color: '#64748b' }
  ];

  private isDarkModeSubject = new BehaviorSubject<boolean>(true);
  isDarkMode$ = this.isDarkModeSubject.asObservable();

  private currentSchemeSubject = new BehaviorSubject<string>('sunset');
  currentScheme$ = this.currentSchemeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const isDark = savedTheme === 'dark';
    
    const savedScheme = localStorage.getItem('color-scheme') || 'sunset';
    
    this.isDarkModeSubject.next(isDark);
    this.currentSchemeSubject.next(savedScheme);
    
    this.applyThemeToDOM(isDark, savedScheme);
  }

  toggleDarkMode() {
    const isDark = !this.isDarkModeSubject.value;
    const currentScheme = this.currentSchemeSubject.value;
    
    this.isDarkModeSubject.next(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    this.applyThemeToDOM(isDark, currentScheme);
  }

  setColorScheme(schemeId: string) {
    const isDark = this.isDarkModeSubject.value;
    
    this.currentSchemeSubject.next(schemeId);
    localStorage.setItem('color-scheme', schemeId);
    
    this.applyThemeToDOM(isDark, schemeId);
  }

  private applyThemeToDOM(isDark: boolean, schemeId: string) {
    const themeStr = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeStr);
    document.documentElement.setAttribute('data-bs-theme', themeStr);
    document.documentElement.setAttribute('data-color', schemeId);
  }
}

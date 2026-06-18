import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly DEFAULT_WIDTH = 260;
  private readonly MIN_WIDTH = 180;
  private readonly MAX_WIDTH = 400;

  private _hiddenSubject = new BehaviorSubject<boolean>(false);
  private _widthSubject  = new BehaviorSubject<number>(this.DEFAULT_WIDTH);

  public hidden$ = this._hiddenSubject.asObservable();
  public width$  = this._widthSubject.asObservable();

  constructor() {
    // Load from localStorage if present
    const savedWidth = localStorage.getItem('sidebar-width');
    if (savedWidth) {
      const w = parseInt(savedWidth, 10);
      if (!isNaN(w)) {
        this.setSidebarWidth(w);
      }
    }
    const savedHidden = localStorage.getItem('sidebar-hidden');
    if (savedHidden !== null) {
      this._hiddenSubject.next(savedHidden === 'true');
    }
  }

  get isHidden()  { return this._hiddenSubject.value; }
  get sidebarWidth() { return this._widthSubject.value; }

  toggleSidebar() {
    const nextVal = !this._hiddenSubject.value;
    this._hiddenSubject.next(nextVal);
    localStorage.setItem('sidebar-hidden', String(nextVal));
  }

  setSidebarWidth(w: number) {
    const clamped = Math.max(this.MIN_WIDTH, Math.min(this.MAX_WIDTH, w));
    this._widthSubject.next(clamped);
    localStorage.setItem('sidebar-width', String(clamped));
    document.documentElement.style.setProperty('--sidebar-width', `${clamped}px`);
  }

  resetWidth() {
    this.setSidebarWidth(this.DEFAULT_WIDTH);
  }

  // --- Legacy compat so old code doesn't break ---
  get isCollapsed() { return false; }
  toggleCollapse()  { this.toggleSidebar(); }
  setCollapse(v: boolean) { 
    this._hiddenSubject.next(v);
    localStorage.setItem('sidebar-hidden', String(v));
  }
}

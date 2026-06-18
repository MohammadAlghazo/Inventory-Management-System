import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private isCollapsedSubject = new BehaviorSubject<boolean>(false);
  public isCollapsed$ = this.isCollapsedSubject.asObservable();

  toggleCollapse() {
    this.isCollapsedSubject.next(!this.isCollapsedSubject.value);
  }

  setCollapse(val: boolean) {
    this.isCollapsedSubject.next(val);
  }

  get isCollapsed() {
    return this.isCollapsedSubject.value;
  }
}

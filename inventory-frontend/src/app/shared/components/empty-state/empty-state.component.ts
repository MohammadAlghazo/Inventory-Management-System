import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <ng-content></ng-content>
      <h3>{{ title }}</h3>
      <p class="text-muted" *ngIf="message">{{ message }}</p>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title: string = 'No Data Found';
  @Input() message?: string;
}

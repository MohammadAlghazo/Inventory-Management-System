import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state" [style.padding]="padding">
      <div class="spinner"></div>
      <p class="text-muted mt-2" *ngIf="message">{{ message }}</p>
    </div>
  `
})
export class SpinnerComponent {
  @Input() message?: string;
  @Input() padding: string = '60px 20px';
}

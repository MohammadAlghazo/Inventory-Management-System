import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule, User, Lock, Eye, EyeOff, AlertCircle, TrendingUp, Boxes, Users, X } from 'lucide-angular';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  icons = { User, Lock, Eye, EyeOff, AlertCircle, TrendingUp, Boxes, Users, X };
  
  credentials = {
    username: '',
    password: ''
  };
  error: string = '';
  isLoading: boolean = false;
  showPassword = false;

  // Contact Modal
  showContactModal = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // ─── Scroll helpers ───────────────────────────────────────────────────────
  scrollToModules() {
    document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToSteps() {
    document.querySelector('.steps-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToStats() {
    document.querySelector('.banner-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToOverview() {
    document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' });
  }

  // ─── Contact Modal ────────────────────────────────────────────────────────
  openContactModal() {
    this.showContactModal = true;
  }

  closeContactModal() {
    this.showContactModal = false;
  }

  onSubmit() {
    this.error = '';
    
    if (!this.credentials.username || !this.credentials.password) {
      this.error = this.translate.instant('LOGIN.ERR_FILL_FIELDS');
      return;
    }

    this.isLoading = true;
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        this.error = '';
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || this.translate.instant('LOGIN.ERR_INVALID_CREDS');
      }
    });
  }

  showForgotPasswordModal = false;
  forgotPasswordEmail = '';
  isResetting = false;
  resetError = '';
  resetSuccess = '';

  openForgotPassword() {
    this.showForgotPasswordModal = true;
    this.forgotPasswordEmail = '';
    this.resetError = '';
    this.resetSuccess = '';
  }

  closeForgotPassword() {
    this.showForgotPasswordModal = false;
  }

  submitForgotPassword() {
    this.resetError = '';
    this.resetSuccess = '';

    if (!this.forgotPasswordEmail) {
      this.resetError = this.translate.instant('LOGIN.RESET_EMAIL_REQUIRED');
      return;
    }

    this.isResetting = true;
    this.authService.forgotPassword(this.forgotPasswordEmail).subscribe({
      next: (res) => {
        this.isResetting = false;
        this.resetSuccess = res.message || this.translate.instant('LOGIN.RESET_SUCCESS');
      },
      error: (err) => {
        this.isResetting = false;
        this.resetError = err.error?.message || this.translate.instant('LOGIN.RESET_ERROR');
      }
    });
  }
}

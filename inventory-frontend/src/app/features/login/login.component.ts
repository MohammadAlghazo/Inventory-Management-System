import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule, User, Lock, Eye, EyeOff, AlertCircle, TrendingUp, Boxes, Users } from 'lucide-angular';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  icons = { User, Lock, Eye, EyeOff, AlertCircle, TrendingUp, Boxes, Users };
  
  credentials = {
    username: '',
    password: ''
  };
  error: string = '';
  isLoading: boolean = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  scrollToOverview() {
    document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' });
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
      this.resetError = 'Please enter your email.';
      return;
    }

    this.isResetting = true;
    this.authService.forgotPassword(this.forgotPasswordEmail).subscribe({
      next: (res) => {
        this.isResetting = false;
        this.resetSuccess = res.message || 'If that email exists in our system, a temporary password has been sent.';
      },
      error: (err) => {
        this.isResetting = false;
        this.resetError = err.error?.message || 'An error occurred. Please try again.';
      }
    });
  }
}

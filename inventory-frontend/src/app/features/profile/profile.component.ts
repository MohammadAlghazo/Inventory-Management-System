import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, User, Mail, Lock, Eye, EyeOff, Save, CheckCircle, XCircle, ShieldCheck, Calendar, UserCircle2 } from 'lucide-angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  readonly icons = { User, Mail, Lock, Eye, EyeOff, Save, CheckCircle, XCircle, ShieldCheck, Calendar, UserCircle2 };

  // Profile data
  profile: any = null;
  isLoadingProfile = true;

  // Info form
  infoForm = { firstName: '', lastName: '', email: '' };
  isSavingInfo = false;
  infoSuccess = '';
  infoError = '';

  // Password form
  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  isSavingPassword = false;
  passwordSuccess = '';
  passwordError = '';
  showCurrentPass = false;
  showNewPass = false;
  showConfirmPass = false;

  constructor(
    private profileService: ProfileService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoadingProfile = true;
    this.profileService.getMe().subscribe({
      next: (res) => {
        this.profile = res.data;
        this.infoForm = {
          firstName: this.profile.firstName,
          lastName: this.profile.lastName,
          email: this.profile.email
        };
        this.isLoadingProfile = false;
      },
      error: () => { this.isLoadingProfile = false; }
    });
  }

  saveInfo() {
    this.infoSuccess = '';
    this.infoError = '';

    if (!this.infoForm.firstName.trim() || !this.infoForm.email.trim()) {
      this.infoError = this.translate.instant('PROFILE.ERR_REQUIRED_FIELDS');
      return;
    }

    this.isSavingInfo = true;
    this.profileService.updateProfile(this.infoForm).subscribe({
      next: (res) => {
        this.isSavingInfo = false;
        this.profile = res.data;
        this.infoSuccess = this.translate.instant('PROFILE.INFO_SAVED');
        setTimeout(() => this.infoSuccess = '', 3000);
      },
      error: (err) => {
        this.isSavingInfo = false;
        this.infoError = err.error?.message || this.translate.instant('PROFILE.ERR_GENERIC');
      }
    });
  }

  savePassword() {
    this.passwordSuccess = '';
    this.passwordError = '';

    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword) {
      this.passwordError = this.translate.instant('PROFILE.ERR_REQUIRED_FIELDS');
      return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = this.translate.instant('PROFILE.ERR_PASSWORDS_MISMATCH');
      return;
    }
    if (this.passwordForm.newPassword.length < 6) {
      this.passwordError = this.translate.instant('PROFILE.ERR_PASSWORD_TOO_SHORT');
      return;
    }

    this.isSavingPassword = true;
    this.profileService.changePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: () => {
        this.isSavingPassword = false;
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.passwordSuccess = this.translate.instant('PROFILE.PASSWORD_CHANGED');
        setTimeout(() => this.passwordSuccess = '', 4000);
      },
      error: (err) => {
        this.isSavingPassword = false;
        this.passwordError = err.error?.message || this.translate.instant('PROFILE.ERR_WRONG_PASS');
      }
    });
  }

  getInitials(): string {
    if (!this.profile) return '?';
    return `${this.profile.firstName?.[0] || ''}${this.profile.lastName?.[0] || ''}`.toUpperCase() || this.profile.username?.[0]?.toUpperCase() || '?';
  }

  getRoleBadgeClass(): string {
    return this.profile?.isAdmin ? 'badge-manager' : 'badge-employee';
  }
}

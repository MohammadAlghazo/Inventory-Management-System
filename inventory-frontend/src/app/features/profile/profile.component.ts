import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, User, Mail, Lock, Eye, EyeOff, Save, CheckCircle, XCircle, ShieldCheck, Calendar, UserCircle2 } from 'lucide-angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ProfileService } from '../../core/services/profile.service';
import { UserService } from '../../core/services/user.service';
import { environment } from '../../../environments/environment';
import { SweetAlertService } from '../../core/services/sweetalert.service';
import { ProfilePictureModalComponent } from '../../shared/components/profile-picture-modal/profile-picture-modal.component';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe, ProfilePictureModalComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  environment = environment;
  showProfilePictureModal = false;

  readonly icons = { User, Mail, Lock, Eye, EyeOff, Save, CheckCircle, XCircle, ShieldCheck, Calendar, UserCircle2 };

  profile: any = null;
  isLoadingProfile = true;

  infoForm = { firstName: '', lastName: '', email: '' };
  isSavingInfo = false;
  infoSuccess = '';
  infoError = '';

  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  isSavingPassword = false;
  passwordSuccess = '';
  passwordError = '';
  showCurrentPass = false;
  showNewPass = false;
  showConfirmPass = false;

  constructor(
    private profileService: ProfileService,
    private userService: UserService,
    private translate: TranslateService,
    private sweetAlert: SweetAlertService
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

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.infoForm.email.trim())) {
      this.infoError = 'Invalid email format';
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
    return this.profile?.role === 'SuperAdmin' ? 'badge-accent' : 'badge-info';
  }

  getRoleKey(role: string | undefined): string {
    const keys: Record<string, string> = {
      SuperAdmin: 'USERS.ROLE_SUPER_ADMIN',
      InventoryManager: 'USERS.ROLE_INVENTORY_MANAGER',
      WarehouseStaff: 'USERS.ROLE_WAREHOUSE_STAFF',
      PurchasingOfficer: 'USERS.ROLE_PURCHASING_OFFICER',
      Sales: 'USERS.ROLE_SALES',
      Accountant: 'USERS.ROLE_ACCOUNTANT',
      Auditor: 'USERS.ROLE_AUDITOR',
      Manager: 'USERS.ROLE_MANAGER',
      Employee: 'USERS.ROLE_EMPLOYEE'
    };
    return keys[role || ''] || role || '';
  }
  openProfilePictureModal() {
    this.showProfilePictureModal = true;
  }

  closeProfilePictureModal() {
    this.showProfilePictureModal = false;
  }

  onProfilePictureUploaded(url: string) {
    this.showProfilePictureModal = false;
    this.userService.updateProfilePicture(this.profile.id, url).subscribe({
      next: (res) => {
        this.profile.profilePicture = url;
        this.profileService.updateProfilePictureInState(url);
      },
      error: (err) => {
        this.sweetAlert.error(
          this.translate.instant('COMMON.ERROR'),
          err.error?.message || this.translate.instant('PROFILE.PICTURE_UPDATE_FAILED')
        );
      }
    });
  }

  deleteProfilePicture() {
    this.sweetAlert.confirm(
      this.translate.instant('PROFILE.DELETE_PICTURE_TITLE'),
      this.translate.instant('PROFILE.CONFIRM_DELETE_PICTURE'),
      this.translate.instant('COMMON.YES_DELETE')
    ).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteProfilePicture(this.profile.id).subscribe({
          next: (res) => {
            this.profile.profilePicture = null;
            this.profileService.updateProfilePictureInState(null);
            this.sweetAlert.toast(this.translate.instant('PROFILE.PICTURE_DELETED'));
          },
          error: (err) => {
            this.sweetAlert.error(
              this.translate.instant('COMMON.ERROR'),
              err.error?.message || this.translate.instant('PROFILE.PICTURE_DELETE_FAILED')
            );
          }
        });
      }
    });
  }
}

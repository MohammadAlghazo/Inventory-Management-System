import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule, Search, Users, Shield, User,
  UserCheck, UserX, Trash2, Plus, Eye, Pencil, X, Save,
  ChevronLeft, ChevronRight, UserCircle2, UploadCloud
} from 'lucide-angular';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ExportExcelService } from '../../core/services/export-excel.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';
import { ProfileService } from '../../core/services/profile.service';
import { ProfilePictureModalComponent } from '../../shared/components/profile-picture-modal/profile-picture-modal.component';
import { environment } from '../../../environments/environment';
import { SweetAlertService } from '../../core/services/sweetalert.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe, EmptyStateComponent, SpinnerComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit, OnDestroy {
  environment = environment;
  showProfilePictureModal = false;
  selectedUserIdForPicture: number | null = null;

  readonly icons = { UserCircle2, Search, Users, Shield, User, UserCheck, UserX, Trash2, Plus, Eye, Pencil, X, Save, ChevronLeft, ChevronRight, UploadCloud };

  users: any[] = [];
  totalCount = 0;
  totalPages = 1;
  page = 1;
  pageSize = 15;
  searchQuery = '';
  searchSubject = new Subject<string>();
  selectedRole = '';
  selectedStatus = '';
  isLoading = false;

  deleteConfirm: any = null;
  isDeleting = false;

  showRegisterModal = false;
  isRegistering = false;
  registerError = '';
  newUser = { username: '', email: '', password: '', firstName: '', lastName: '', role: 'WarehouseStaff' };

  viewUser: any = null;

  editUser: any = null;
  editForm = { firstName: '', lastName: '', email: '', role: 'WarehouseStaff' };
  isSavingEdit = false;
  editError = '';
  editSuccess = '';

  currentUser: any;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private translate: TranslateService,
    private exportExcel: ExportExcelService,
    private exportPdf: ExportPdfService,
    private sweetAlert: SweetAlertService,
    private profileService: ProfileService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() { 
    this.loadUsers(); 

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.page = 1;
      this.loadUsers();
    });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  get currentUserId() {
    return this.currentUser?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  }

  getRoleKey(role: string | undefined) {
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

  loadUsers() {
    this.isLoading = true;
    let isActive: boolean | undefined = undefined;
    if (this.selectedStatus === 'active') isActive = true;
    else if (this.selectedStatus === 'inactive') isActive = false;

    this.userService.getUsers(this.page, this.pageSize, this.searchQuery, isActive, this.selectedRole || undefined).subscribe({
      next: (res) => {
        this.users = res.data?.items || [];
        this.totalCount = res.data?.totalCount || 0;
        this.totalPages = res.data?.totalPages || 1;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getFilteredUsers() {
    return this.users;
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  onFilterChange() {
    this.page = 1;
    this.loadUsers();
  }

  onPageSizeChange() {
    this.page = 1;
    this.loadUsers();
  }

  onSearch() { this.page = 1; this.loadUsers(); }
  prevPage() { if (this.page > 1) { this.page--; this.loadUsers(); } }
  nextPage() { if (this.page < this.totalPages) { this.page++; this.loadUsers(); } }

  goToPage(pg: number) {
    this.page = pg;
    this.loadUsers();
  }

  getPagesArray(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.page - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  exportToExcel() {
    this.userService.getUsers(1, 10000, this.searchQuery).subscribe({
      next: (res: any) => {
        const dataToExport = (res?.data?.items || []).map((u: any) => ({
          'ID': u.id,
          'Username': u.username,
          'Email': u.email,
          'Full Name': `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—',
          'Role': u.role,
          'Status': u.isActive ? 'Active' : 'Inactive'
        }));
        this.exportExcel.export(dataToExport, 'Users_Report');
      }
    });
  }

  exportToPdf() {
    this.exportPdf.export('users-table', 'Users_Report');
  }

  toggleStatus(user: any) {
    this.userService.toggleStatus(user.id).subscribe(() => {
      this.sweetAlert.toast(this.translate.instant('USERS.STATUS_UPDATE_SUCCESS'));
      this.loadUsers();
    });
  }

  confirmDelete(user: any) { this.deleteConfirm = user; }

  deleteUser() {
    if (!this.deleteConfirm) return;
    this.isDeleting = true;
    this.userService.deleteUser(this.deleteConfirm.id).subscribe({
      next: () => { 
        this.isDeleting = false; 
        this.deleteConfirm = null; 
        this.sweetAlert.toast(this.translate.instant('USERS.DELETE_SUCCESS'));
        this.loadUsers(); 
      },
      error: () => this.isDeleting = false
    });
  }

  openRegister() {
    this.registerError = '';
    this.newUser = { username: '', email: '', password: '', firstName: '', lastName: '', role: 'WarehouseStaff' };
    this.showRegisterModal = true;
  }

  registerUser() {
    this.isRegistering = true;
    this.registerError = '';
    this.authService.register(this.newUser).subscribe({
      next: () => { 
        this.isRegistering = false; 
        this.showRegisterModal = false; 
        this.sweetAlert.toast(this.translate.instant('USERS.REGISTER_SUCCESS'));
        this.loadUsers(); 
      },
      error: (err) => {
        this.isRegistering = false;
        this.registerError = err.error?.message || this.translate.instant('USERS.REGISTER_FAILED');
      }
    });
  }

  openView(user: any) { this.viewUser = user; }
  closeView() { this.viewUser = null; }

  openEdit(user: any) {
    this.editUser = user;
    this.editForm = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || 'WarehouseStaff'
    };
    this.editError = '';
    this.editSuccess = '';
  }

  closeEdit() { this.editUser = null; }

  saveEdit() {
    if (!this.editForm.firstName?.trim()) {
      this.editError = this.translate.instant('PROFILE.ERR_REQUIRED_FIELDS');
      return;
    }
    if (!this.editForm.email?.trim()) {
      this.editError = this.translate.instant('PROFILE.ERR_REQUIRED_FIELDS');
      return;
    }
    this.isSavingEdit = true;
    this.editError = '';
    this.userService.updateUser(this.editUser.id, this.editForm).subscribe({
      next: () => {
        this.isSavingEdit = false;
        this.editSuccess = this.translate.instant('PROFILE.INFO_SAVED');
        this.loadUsers();
        setTimeout(() => this.closeEdit(), 1500);
      },
      error: (err) => {
        this.isSavingEdit = false;
        this.editError = err.error?.message || this.translate.instant('PROFILE.ERR_GENERIC');
      }
    });
  }

  openProfilePictureModal(user: any) {
    this.selectedUserIdForPicture = user.id;
    this.showProfilePictureModal = true;
  }

  closeProfilePictureModal() {
    this.showProfilePictureModal = false;
    this.selectedUserIdForPicture = null;
  }

  onProfilePictureUploaded(url: string) {
    this.showProfilePictureModal = false;
    if (this.selectedUserIdForPicture) {
      this.userService.updateProfilePicture(this.selectedUserIdForPicture, url).subscribe({
        next: () => {
          this.sweetAlert.toast(this.translate.instant('PROFILE.PICTURE_UPDATED'));
          if (String(this.selectedUserIdForPicture) === String(this.currentUserId)) {
            this.profileService.updateProfilePictureInState(url);
          }
          this.loadUsers();
          this.selectedUserIdForPicture = null;
        },
        error: (err) => this.sweetAlert.error(
          this.translate.instant('COMMON.ERROR'),
          err.error?.message || this.translate.instant('PROFILE.PICTURE_UPDATE_FAILED')
        )
      });
    }
  }

  deleteProfilePicture(user: any) {
    this.sweetAlert.confirm(
      this.translate.instant('PROFILE.DELETE_PICTURE_TITLE'),
      this.translate.instant('PROFILE.CONFIRM_DELETE_PICTURE'),
      this.translate.instant('COMMON.YES_DELETE')
    ).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteProfilePicture(user.id).subscribe({
          next: () => {
            this.sweetAlert.toast(this.translate.instant('PROFILE.PICTURE_DELETED'));
            if (String(user.id) === String(this.currentUserId)) {
              this.profileService.updateProfilePictureInState(null);
            }
            this.loadUsers();
          },
          error: (err) => this.sweetAlert.error(
            this.translate.instant('COMMON.ERROR'),
            err.error?.message || this.translate.instant('PROFILE.PICTURE_DELETE_FAILED')
          )
        });
      }
    });
  }
}

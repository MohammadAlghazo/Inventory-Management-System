import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule, Search, Users, Shield, User,
  UserCheck, UserX, Trash2, Plus, Eye, Pencil, X, Save,
  ChevronLeft, ChevronRight, UserCircle2
} from 'lucide-angular';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ExportExcelService } from '../../core/services/export-excel.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';
import { ProfilePictureModalComponent } from '../../shared/components/profile-picture-modal/profile-picture-modal.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe, ProfilePictureModalComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  environment = environment;
  showProfilePictureModal = false;
  selectedUserIdForPicture: number | null = null;

  readonly icons = { UserCircle2, Search, Users, Shield, User, UserCheck, UserX, Trash2, Plus, Eye, Pencil, X, Save, ChevronLeft, ChevronRight };

  users: any[] = [];
  totalCount = 0;
  totalPages = 1;
  page = 1;
  pageSize = 15;
  searchQuery = '';
  selectedRole = '';
  selectedStatus = '';
  isLoading = false;

  deleteConfirm: any = null;
  isDeleting = false;

  showRegisterModal = false;
  isRegistering = false;
  registerError = '';
  newUser = { username: '', email: '', password: '', firstName: '', lastName: '', role: 'Employee' };

  viewUser: any = null;

  editUser: any = null;
  editForm = { firstName: '', lastName: '', email: '', role: 'Employee' };
  isSavingEdit = false;
  editError = '';
  editSuccess = '';

  currentUser: any;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private translate: TranslateService,
    private exportExcel: ExportExcelService,
    private exportPdf: ExportPdfService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() { this.loadUsers(); }

  get currentUserId() {
    return this.currentUser?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getUsers(this.page, this.pageSize, this.searchQuery).subscribe({
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
    return this.users.filter(u => {
      const q = this.searchQuery.trim().toLowerCase();
      const matchesSearch = q ? (
        String(u.id).includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(q)
      ) : true;

      const matchesRole = this.selectedRole ? u.role === this.selectedRole : true;

      let matchesStatus = true;
      if (this.selectedStatus === 'active') {
        matchesStatus = u.isActive === true;
      } else if (this.selectedStatus === 'inactive') {
        matchesStatus = u.isActive === false;
      }

      return matchesSearch && matchesRole && matchesStatus;
    });
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

  getPagesArray() {
    const pages = [];
    const maxPages = Math.min(this.totalPages, 5);
    for (let i = 1; i <= maxPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  exportToExcel() {
    const dataToExport = this.getFilteredUsers().map(u => ({
      'ID': u.id,
      'Username': u.username,
      'Email': u.email,
      'Full Name': `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—',
      'Role': u.role,
      'Status': u.isActive ? 'Active' : 'Inactive'
    }));
    this.exportExcel.export(dataToExport, 'Users_Report');
  }

  exportToPdf() {
    this.exportPdf.export('users-table', 'Users_Report');
  }

  toggleStatus(user: any) {
    this.userService.toggleStatus(user.id).subscribe(() => this.loadUsers());
  }

  confirmDelete(user: any) { this.deleteConfirm = user; }

  deleteUser() {
    if (!this.deleteConfirm) return;
    this.isDeleting = true;
    this.userService.deleteUser(this.deleteConfirm.id).subscribe({
      next: () => { this.isDeleting = false; this.deleteConfirm = null; this.loadUsers(); },
      error: () => this.isDeleting = false
    });
  }

  openRegister() {
    this.registerError = '';
    this.newUser = { username: '', email: '', password: '', firstName: '', lastName: '', role: 'Employee' };
    this.showRegisterModal = true;
  }

  registerUser() {
    this.isRegistering = true;
    this.registerError = '';
    this.authService.register(this.newUser).subscribe({
      next: () => { this.isRegistering = false; this.showRegisterModal = false; this.loadUsers(); },
      error: (err) => {
        this.isRegistering = false;
        this.registerError = err.error?.message || 'Failed to register user.';
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
      role: user.role || 'Employee'
    };
    this.editError = '';
    this.editSuccess = '';
  }

  closeEdit() { this.editUser = null; }

  saveEdit() {
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
          this.loadUsers();
          this.selectedUserIdForPicture = null;
        },
        error: (err) => console.error(err)
      });
    }
  }

  deleteProfilePicture(user: any) {
    if (confirm(this.translate.instant('PROFILE.CONFIRM_DELETE_PICTURE') || 'Are you sure you want to delete this profile picture?')) {
      this.userService.deleteProfilePicture(user.id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error(err)
      });
    }
  }
}

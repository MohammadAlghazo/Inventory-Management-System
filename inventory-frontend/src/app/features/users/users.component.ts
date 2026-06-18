import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Users, Shield, User, UserCheck, UserX, Trash2, Plus } from 'lucide-angular';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  readonly icons = { Search, Users, Shield, User, UserCheck, UserX, Trash2, Plus };

  users: any[] = [];
  totalCount = 0;
  totalPages = 1;
  page = 1;
  searchQuery = '';
  isLoading = false;

  deleteConfirm: any = null;
  isDeleting = false;

  // Registration Modal
  showRegisterModal = false;
  isRegistering = false;
  registerError = '';
  newUser = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'Employee'
  };

  currentUser: any;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadUsers();
  }

  get currentUserId() {
    return this.currentUser?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getUsers(this.page, 15, this.searchQuery).subscribe({
      next: (res) => {
        this.users = res.data?.items || [];
        this.totalCount = res.data?.totalCount || 0;
        this.totalPages = res.data?.totalPages || 1;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSearch() {
    this.page = 1;
    this.loadUsers();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadUsers();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadUsers();
    }
  }

  toggleStatus(user: any) {
    this.userService.toggleStatus(user.id).subscribe(() => {
      this.loadUsers();
    });
  }

  confirmDelete(user: any) {
    this.deleteConfirm = user;
  }

  deleteUser() {
    if (!this.deleteConfirm) return;
    this.isDeleting = true;
    this.userService.deleteUser(this.deleteConfirm.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deleteConfirm = null;
        this.loadUsers();
      },
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
      next: () => {
        this.isRegistering = false;
        this.showRegisterModal = false;
        this.loadUsers();
      },
      error: (err) => {
        this.isRegistering = false;
        this.registerError = err.error?.message || 'Failed to register user. Check validation rules.';
      }
    });
  }
}

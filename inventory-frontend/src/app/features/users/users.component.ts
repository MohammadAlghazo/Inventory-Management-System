import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, UserPlus, Search, Edit2, Trash2 } from 'lucide-angular';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-users',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  isLoading = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (data: any[]) => {
        this.users = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}

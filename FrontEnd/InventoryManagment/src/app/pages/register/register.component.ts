import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {

  authService = inject(AuthService);
  router = inject(Router);

  registerObj: any = {
    userName: '',
    email: '',
    password: '',
    roles: ''
  };

onSubmit() {
    if(!this.registerObj.userName || !this.registerObj.password || !this.registerObj.roles) {
      Swal.fire("Warning", "Please fill all required fields", "warning");
      return;
    }

    const payload = {
      userName: this.registerObj.userName,
      email: this.registerObj.email,
      password: this.registerObj.password,
      roles: [this.registerObj.roles] 
    };

    this.authService.register(payload).subscribe({
      next: (res: any) => {
        Swal.fire({
          title: "Success!",
          text: `User ${this.registerObj.userName} has been created successfully! 🎉`,
          icon: "success"
        }).then(() => {
          this.registerObj = { userName: '', email: '', password: '', roles: '' };
        });
      },
      error: (err) => {
        let errorMsg = "Failed to create user.";
        if (err.error && err.error.message) {
            errorMsg = err.error.message;
        }
        Swal.fire("Error", errorMsg, "error");
      }
    });
  }
}
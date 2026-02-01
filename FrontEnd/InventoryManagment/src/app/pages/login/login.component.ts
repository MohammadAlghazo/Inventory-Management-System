import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  authService = inject(AuthService);
  router = inject(Router);

    loginObj: any = {
        username: '',
        password: ''
      };

onLogin() {
    this.authService.login(this.loginObj).subscribe({
      next: (res: any) => {
        console.log("Response:", res);
        
        localStorage.setItem('token', res); 
        
        alert("Login Success! ✅");
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        alert("Login Failed! ❌");
      }
    });
  }
}
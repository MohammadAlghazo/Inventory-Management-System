import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { jwtDecode } from "jwt-decode";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  http = inject(HttpClient);
  router = inject(Router);

  private baseUrl = 'https://localhost:44374/api/Auth/';

  constructor() { }

  register(userData: any) {
    return this.http.post(`${this.baseUrl}Register`, userData);
  }

  login(loginData: any) {
    return this.http.post(`${this.baseUrl}Login`, loginData, { responseType: 'text' });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getUserRole(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    
    try {
      const decoded: any = jwtDecode(token);
      const roleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
      return decoded[roleKey] || '';
    } catch (error) {
      return '';
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
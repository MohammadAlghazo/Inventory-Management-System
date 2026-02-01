import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  http = inject(HttpClient);
  
  apiUrl = 'https://localhost:44374/api/Auth/Login';

  constructor() { }

login(loginData: any) {
    return this.http.post(this.apiUrl, loginData, { responseType: 'text' });
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
}
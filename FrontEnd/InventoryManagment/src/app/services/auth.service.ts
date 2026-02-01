import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

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
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isTokenValid());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Clean up expired token on startup
    if (!this.isTokenValid()) {
      localStorage.removeItem('token');
    }
  }

  login(credentials: any): Observable<any> {
    // Remove any stale token before a fresh login attempt
    localStorage.removeItem('token');
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout() {
    localStorage.removeItem('token');
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasToken(): boolean {
    return this.isTokenValid();
  }

  isTokenValid(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) return true; // no expiry claim — treat as valid
      const nowSeconds = Math.floor(Date.now() / 1000);
      return decoded.exp > nowSeconds;
    } catch {
      return false;
    }
  }

  getCurrentUser(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }
}

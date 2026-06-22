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
    
    if (!this.isTokenValid()) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }

  login(credentials: any): Observable<any> {
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('permissions');
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
          }
          if (response.data.user && response.data.user.permissions) {
            localStorage.setItem('permissions', JSON.stringify(response.data.user.permissions));
          } else if (response.data.user && response.data.user.role === 'SuperAdmin') {
            localStorage.setItem('permissions', JSON.stringify(['*']));
          }
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('permissions');
    this.isAuthenticatedSubject.next(false);
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap((response: any) => {
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
          }
          if (response.data.user && response.data.user.permissions) {
            localStorage.setItem('permissions', JSON.stringify(response.data.user.permissions));
          } else if (response.data.user && response.data.user.role === 'SuperAdmin') {
            localStorage.setItem('permissions', JSON.stringify(['*']));
          }
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
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
      if (!decoded.exp) return true; 
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

  hasPermission(permission: string): boolean {
    const permissionsStr = localStorage.getItem('permissions');
    if (!permissionsStr) return false;
    try {
      const permissions: string[] = JSON.parse(permissionsStr);
      if (permissions.includes('*')) return true; // SuperAdmin
      if (permissions.length > 0) {
        return permissions.includes(permission);
      }
    } catch {}

    // Fallback to role checks if no granular permissions exist
    const user = this.getCurrentUser();
    const role = user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    
    if (role === 'SuperAdmin') return true;
    
    if (permission.startsWith('Manage_') || permission.startsWith('Delete_') || permission.startsWith('Edit_') || permission.startsWith('Create_')) {
       return role === 'InventoryManager';
    }
    
    return false;
  }
}

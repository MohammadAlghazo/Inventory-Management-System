import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  /** GET /api/auth/me */
  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  /** PUT /api/auth/update-profile */
  updateProfile(data: { email: string; firstName: string; lastName: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-profile`, data);
  }

  /** PUT /api/auth/change-password */
  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, data);
  }
}

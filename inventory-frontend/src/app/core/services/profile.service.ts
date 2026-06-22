import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentProfileSubject = new BehaviorSubject<any>(null);
  public currentProfile$ = this.currentProfileSubject.asObservable();

  constructor(private http: HttpClient) {}

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`).pipe(
      tap((res: any) => {
        if (res && res.data) {
          this.currentProfileSubject.next(res.data);
        }
      })
    );
  }

  updateProfile(data: { email: string; firstName: string; lastName: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-profile`, data).pipe(
      tap((res: any) => {
        if (res && res.data) {
          this.currentProfileSubject.next(res.data);
        }
      })
    );
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, data);
  }

  updateProfilePictureInState(url: string | null) {
    const current = this.currentProfileSubject.value;
    if (current) {
      current.profilePicture = url;
      this.currentProfileSubject.next({ ...current });
    }
  }
}

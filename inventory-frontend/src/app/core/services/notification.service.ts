import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'Info' | 'Success' | 'Warning' | 'Danger';
  targetRole: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<{ success: boolean; data: Notification[] }> {
    return this.http.get<{ success: boolean; data: Notification[] }>(this.apiUrl);
  }

  markAsRead(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-read/${id}`, {});
  }

  markAllRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-all-read`, {});
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

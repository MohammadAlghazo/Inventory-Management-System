import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(page: number = 1, pageSize: number = 15, search?: string): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${search}`;
    return this.http.get<any>(url);
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: number, dto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, dto);
  }

  updateProfilePicture(id: number, profilePictureUrl: string): Observable<any> {
    return this.http.put(`//profile-picture`, { profilePictureUrl });
  }

  deleteProfilePicture(id: number): Observable<any> {
    return this.http.delete(`//profile-picture`);
  }
}
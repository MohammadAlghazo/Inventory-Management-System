import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = `${environment.apiUrl}/audit`;

  constructor(private http: HttpClient) {}

  getAuditLogs(page: number = 1, pageSize: number = 20, search?: string): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.http.get<any>(url);
  }
}

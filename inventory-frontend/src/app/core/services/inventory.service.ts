import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getInventoryLogs(page: number = 1, pageSize: number = 15, action?: string, search?: string): Observable<any> {
    let url = `${this.apiUrl}/logs?page=${page}&pageSize=${pageSize}`;
    if (action) url += `&action=${action}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.http.get<any>(url);
  }

  addStock(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, data);
  }

  sellStock(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sell`, data);
  }

  adjustStock(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/adjust`, data);
  }

  returnStock(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/return`, data);
  }
}

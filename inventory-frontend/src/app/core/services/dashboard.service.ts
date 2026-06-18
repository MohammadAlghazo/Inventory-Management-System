import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  getActivityChart(days: number = 30): Observable<any> {
    return this.http.get(`${this.apiUrl}/activity-chart?days=${days}`);
  }

  getCategoryBreakdown(): Observable<any> {
    return this.http.get(`${this.apiUrl}/category-breakdown`);
  }

  getTopProducts(limit: number = 5): Observable<any> {
    return this.http.get(`${this.apiUrl}/top-products?limit=${limit}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/Reports`;

  constructor(private http: HttpClient) { }

  getLowStockAlerts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/low-stock`);
  }

  getValuation(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/valuation`);
  }

  getAbcAnalysis(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/abc-analysis`);
  }
}

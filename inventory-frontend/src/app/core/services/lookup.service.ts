import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private apiUrl = `${environment.apiUrl}/Lookup`;

  constructor(private http: HttpClient) { }

  getWarehouses(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/warehouses`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalesOrder, CreateSalesOrderDto, ShipSalesOrderDto } from '../models/sales-order.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalesOrderService {
  private apiUrl = `${environment.apiUrl}/SalesOrders`;

  constructor(private http: HttpClient) { }

  getSalesOrders(page: number = 1, pageSize: number = 10, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  getSalesOrderById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createSalesOrder(data: CreateSalesOrderDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  shipSalesOrder(id: number, data: ShipSalesOrderDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/ship`, data);
  }
}

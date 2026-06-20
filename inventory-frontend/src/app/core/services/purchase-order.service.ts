import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PurchaseOrder, CreatePurchaseOrderDto, ReceivePurchaseOrderDto } from '../models/purchase-order.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  private apiUrl = `${environment.apiUrl}/PurchaseOrders`;

  constructor(private http: HttpClient) { }

  getPurchaseOrders(page: number = 1, pageSize: number = 10, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  getPurchaseOrderById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createPurchaseOrder(data: CreatePurchaseOrderDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  receivePurchaseOrder(id: number, data: ReceivePurchaseOrderDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/receive`, data);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseApiService<any> {
  
  constructor(protected override http: HttpClient) {
    super(http, 'products');
  }

  getProducts(page: number = 1, pageSize: number = 15, search?: string, categoryId?: string, stockStatus?: string): Observable<any> {
    return this.getAll({ page, pageSize, search, categoryId, stockStatus });
  }

  createProduct(data: any): Observable<any> {
    return this.create(data);
  }

  updateProduct(id: number, data: any): Observable<any> {
    return this.update(id, data);
  }

  deleteProduct(id: number): Observable<any> {
    return this.delete(id);
  }

  getLowStockProducts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/low-stock`);
  }

  importProducts(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/import`, formData);
  }
}

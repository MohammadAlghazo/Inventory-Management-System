import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(page: number = 1, pageSize: number = 15, search?: string, categoryId?: string, stockStatus?: string): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    if (stockStatus) url += `&stockStatus=${stockStatus}`;
    return this.http.get<any>(url);
  }

  createProduct(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateProduct(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
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

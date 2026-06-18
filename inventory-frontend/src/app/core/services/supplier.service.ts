import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Supplier {
  id?: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  isActive: boolean;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any;
  statusCode: number;
}

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = `${environment.apiUrl}/suppliers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Supplier[]>> {
    return this.http.get<ApiResponse<Supplier[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<Supplier>> {
    return this.http.get<ApiResponse<Supplier>>(`${this.apiUrl}/${id}`);
  }

  create(supplier: Partial<Supplier>): Observable<ApiResponse<Supplier>> {
    return this.http.post<ApiResponse<Supplier>>(this.apiUrl, supplier);
  }

  update(id: number, supplier: Partial<Supplier>): Observable<ApiResponse<Supplier>> {
    return this.http.put<ApiResponse<Supplier>>(`${this.apiUrl}/${id}`, supplier);
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}

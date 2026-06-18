import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Customer {
  id?: number;
  name: string;
  phone: string;
  email: string;
  address: string;
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
export class CustomerService {
  private apiUrl = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Customer[]>> {
    return this.http.get<ApiResponse<Customer[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<Customer>> {
    return this.http.get<ApiResponse<Customer>>(`${this.apiUrl}/${id}`);
  }

  create(customer: Partial<Customer>): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(this.apiUrl, customer);
  }

  update(id: number, customer: Partial<Customer>): Observable<ApiResponse<Customer>> {
    return this.http.put<ApiResponse<Customer>>(`${this.apiUrl}/${id}`, customer);
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}

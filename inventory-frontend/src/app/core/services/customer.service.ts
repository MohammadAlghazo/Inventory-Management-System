import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

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
export class CustomerService extends BaseApiService<any> {
  
  constructor(protected override http: HttpClient) {
    super(http, 'customers');
  }

  override getAll(page: number = 1, pageSize: number = 10, search: string = '', isActive?: boolean): Observable<ApiResponse<any>> {
    return super.getAll({ page, pageSize, search, isActive });
  }
}

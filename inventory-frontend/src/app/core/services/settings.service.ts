import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Category {
  id: number;
  name: string;
  description: string;
  parentCategoryId?: number;
}

export interface Brand {
  id: number;
  name: string;
  description: string;
}

export interface Unit {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  managerName: string;
  capacity: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/Lookup`;

  constructor(private http: HttpClient) { }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`);
  }

  createCategory(category: Partial<Category>): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, category);
  }

  getBrands(): Observable<any> {
    return this.http.get(`${this.apiUrl}/brands`);
  }

  createBrand(brand: Partial<Brand>): Observable<any> {
    return this.http.post(`${this.apiUrl}/brands`, brand);
  }

  getUnits(): Observable<any> {
    return this.http.get(`${this.apiUrl}/units`);
  }

  createUnit(unit: Partial<Unit>): Observable<any> {
    return this.http.post(`${this.apiUrl}/units`, unit);
  }

  getWarehouses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/warehouses`);
  }

  createWarehouse(warehouse: Partial<Warehouse>): Observable<any> {
    return this.http.post(`${this.apiUrl}/warehouses`, warehouse);
  }
}

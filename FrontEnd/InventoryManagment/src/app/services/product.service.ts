import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  http = inject(HttpClient);

  apiUrl = 'https://localhost:44374/api/Product';

  constructor() { }

  getProducts() {
    return this.http.get<any>(`${this.apiUrl}/GetAllProduct`);
  }

  addProduct(model: any) {
    return this.http.post(`${this.apiUrl}/Add`, model);
  }
}
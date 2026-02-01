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

deleteProduct(id: number) {
  return this.http.delete(`${this.apiUrl}/Delete/${id}`);
}

  getProduct(id: number) {
    return this.http.get(`${this.apiUrl}/GetById/${id}`);
  }

  updateProduct(id: number, product: any) {
    return this.http.put(`${this.apiUrl}/Update`, product);
  }
}
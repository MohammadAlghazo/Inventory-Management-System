import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], 
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  
  productService = inject(ProductService);
  router = inject(Router);
  public authService = inject(AuthService);

  products: any[] = [];
  filteredProducts: any[] = [];
  searchTerm: string = '';    

  constructor() {
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.products = res;
        this.filteredProducts = res;
      },
      error: (err) => {
        console.log("Error fetching products:", err);
      }
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    
    this.filteredProducts = this.products.filter(item => 
      (item.name && item.name.toLowerCase().includes(term)) || 
      (item.category && item.category.toLowerCase().includes(term))
    );
  }

  onDelete(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      
      if (result.isConfirmed) {
        
        this.productService.deleteProduct(id).subscribe({
          next: (res: any) => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Product has been deleted.',
              icon: 'success'
            });

            this.products = this.products.filter(p => p.id !== id);
            this.onSearch();
          },
          error: (err) => {
            console.log(err);
            Swal.fire({
              title: 'Error!',
              text: 'Something went wrong.',
              icon: 'error'
            });
          }
        });
      }
    });
  }
}
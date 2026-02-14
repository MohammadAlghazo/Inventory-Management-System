import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  
  productService = inject(ProductService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  categories: string[] = ['Electronics', 'Groceries', 'Clothing', 'Furniture', 'Accessories', 'Stationery'];

  isEditMode: boolean = false;
  productId: number = 0;

  product: any = {
    name: '',
    price: 0,
    quantity: 0,
    minQuantity: 5,
    category: '',
    description: ''
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.isEditMode = true;
      this.productId = Number(id);
      this.loadProductData(this.productId);
    }
  }

  loadProductData(id: number) {
    this.productService.getProduct(id).subscribe({
      next: (data: any) => {
        this.product = data;
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Error loading product data!',
        });
        console.error(err);
      }
    });
  }

  onSubmit() {
    if (this.isEditMode) {
      this.productService.updateProduct(this.productId, this.product).subscribe({
        next: () => {
          Swal.fire({
            title: "Updated!",
            text: "Product updated successfully ✨",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/products']);
          });
        },
        error: (err) => {
          Swal.fire("Error", "Could not update product ❌", "error");
          console.error(err);
        }
      });

    } else {
      this.productService.addProduct(this.product).subscribe({
        next: () => {
          Swal.fire({
            title: "Great Job!",
            text: "Product added successfully 🚀",
            icon: "success",
            confirmButtonText: "Go to List"
          }).then(() => {
            this.router.navigate(['/products']);
          });
        },
        error: (err) => {
          Swal.fire("Error", "Could not add product ❌", "error");
          console.error(err);
        }
      });
    }
  }
}
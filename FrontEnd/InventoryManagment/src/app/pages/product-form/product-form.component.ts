import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  
  productService = inject(ProductService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  isEditMode: boolean = false;
  productId: number = 0;

  product: any = {
    name: '',
    price: 0,
    quantity: 0,
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
        alert("Error loading product data ❌");
        console.error(err);
      }
    });
  }

  onSubmit() {
    if (this.isEditMode) {
      this.productService.updateProduct(this.productId, this.product).subscribe({
        next: () => {
          alert("Product Updated Successfully! ✅");
          this.router.navigate(['/products']);
        },
        error: (err) => {
          alert("Error updating product ❌");
          console.error(err);
        }
      });

    } else {
      this.productService.addProduct(this.product).subscribe({
        next: () => {
          alert("Product Added Successfully! ✅");
          this.router.navigate(['/products']);
        },
        error: (err) => {
          alert("Error adding product ❌");
          console.error(err);
        }
      });
    }
  }
}
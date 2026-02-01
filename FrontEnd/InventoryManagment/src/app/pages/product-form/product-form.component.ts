import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent {
  router = inject(Router);
  productService = inject(ProductService);

  product: any = {
    name: '',
    price: null,
    quantity: null,
    category: '',
    description: ''
  };

  onSave() {
    this.productService.addProduct(this.product).subscribe({
      next: () => {
        alert('Product Added Successfully! ✅');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error(err);
        alert('Error adding product! ❌');
      }
    });
  }
}
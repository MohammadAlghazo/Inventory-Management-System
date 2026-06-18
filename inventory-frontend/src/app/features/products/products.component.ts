import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Package, Edit, Trash2, ChevronLeft, ChevronRight, LayoutGrid, List, Plus } from 'lucide-angular';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ExportHelper } from '../../core/utils/export-helper';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  readonly icons = { Search, Package, Edit, Trash2, ChevronLeft, ChevronRight, LayoutGrid, List, Plus };

  products: any[] = [];
  totalCount = 0;
  totalPages = 1;
  page = 1;
  searchQuery = '';
  selectedCategory = '';
  selectedStockStatus = '';
  pageSize = 15;
  isLoading = false;
  viewMode: 'table' | 'grid' = 'table';

  categories: any[] = [];

  deleteConfirm: any = null;
  isDeleting = false;

  user: any;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadCategories() {
    this.http.get<any>(`${environment.apiUrl}/lookup/categories`).subscribe({
      next: (res) => this.categories = res.data || [],
      error: () => {}
    });
  }

  get isAdmin() {
    return this.user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Manager';
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts(this.page, this.pageSize, this.searchQuery).subscribe({
      next: (res) => {
        this.products = res.data?.items || [];
        this.totalCount = res.data?.totalCount || 0;
        this.totalPages = res.data?.totalPages || 1;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getFilteredProducts() {
    return this.products.filter(p => {
      const q = this.searchQuery.trim().toLowerCase();
      const matchesSearch = q ? (
        String(p.id).includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      ) : true;

      const matchesCategory = this.selectedCategory ? String(p.categoryId) === this.selectedCategory : true;

      let matchesStock = true;
      if (this.selectedStockStatus === 'in-stock') {
        matchesStock = p.quantity > p.minQuantity;
      } else if (this.selectedStockStatus === 'low-stock') {
        matchesStock = p.quantity <= p.minQuantity && p.quantity > 0;
      } else if (this.selectedStockStatus === 'out-of-stock') {
        matchesStock = p.quantity === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }

  onFilterChange() {
    this.page = 1;
    this.loadProducts();
  }

  onPageSizeChange() {
    this.page = 1;
    this.loadProducts();
  }

  exportToExcel() {
    const dataToExport = this.getFilteredProducts().map(p => ({
      'ID': p.id,
      'Name': p.name,
      'SKU': p.sku,
      'Category': p.category,
      'Price': p.price,
      'Quantity': p.quantity,
      'Min Quantity': p.minQuantity,
      'Supplier': p.supplier || '—',
      'Status': p.isActive ? 'Active' : 'Inactive'
    }));
    ExportHelper.toExcel(dataToExport, 'Products_Report');
  }

  exportToPdf() {
    ExportHelper.toPdf('products-table', 'Products_Report');
  }

  onSearch() {
    this.page = 1;
    this.loadProducts();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadProducts();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadProducts();
    }
  }

  goToPage(pg: number) {
    this.page = pg;
    this.loadProducts();
  }

  getPagesArray() {
    const pages = [];
    const maxPages = Math.min(this.totalPages, 5);
    for (let i = 1; i <= maxPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStockBadgeClass(quantity: number, minQuantity: number) {
    if (quantity === 0) return 'badge-danger';
    if (quantity <= minQuantity) return 'badge-warning';
    return 'badge-success';
  }

  getStockBadgeText(quantity: number, minQuantity: number) {
    if (quantity === 0) return 'PRODUCTS.OUT_OF_STOCK';
    if (quantity <= minQuantity) return 'PRODUCTS.LOW_STOCK';
    return 'PRODUCTS.IN_STOCK';
  }

  confirmDelete(product: any) {
    this.deleteConfirm = product;
  }

  deleteProduct() {
    if (!this.deleteConfirm) return;
    this.isDeleting = true;
    this.productService.deleteProduct(this.deleteConfirm.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deleteConfirm = null;
        this.loadProducts();
      },
      error: () => this.isDeleting = false
    });
  }

  // Product Modal
  showProductModal = false;
  isSavingProduct = false;
  editProduct: any = null;
  productForm: any = {
    name: '', sku: '', categoryId: null, price: 0, unit: '', minQuantity: 0, supplierId: null, description: ''
  };

  openAddProduct() {
    this.editProduct = null;
    this.productForm = { name: '', sku: '', categoryId: null, price: 0, unit: '', minQuantity: 0, supplierId: null, description: '' };
    this.showProductModal = true;
  }

  openEditProduct(product: any) {
    this.editProduct = product;
    this.productForm = {
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      price: product.price,
      unit: product.unit || product.unitName,
      minQuantity: product.minQuantity,
      supplierId: product.supplierId,
      description: product.description || ''
    };
    this.showProductModal = true;
  }

  submitProduct() {
    this.isSavingProduct = true;
    const payload = {
      name: this.productForm.name,
      sku: this.productForm.sku,
      categoryId: this.productForm.categoryId ? Number(this.productForm.categoryId) : null,
      price: Number(this.productForm.price),
      unitId: null,
      minQuantity: Number(this.productForm.minQuantity),
      supplierId: this.productForm.supplierId ? Number(this.productForm.supplierId) : null,
      description: this.productForm.description || '',
      purchasePrice: 0
    };
    const req = this.editProduct
      ? this.productService.updateProduct(this.editProduct.id, payload)
      : this.productService.createProduct(payload);

    req.subscribe({
      next: () => {
        this.isSavingProduct = false;
        this.showProductModal = false;
        this.loadProducts();
      },
      error: () => this.isSavingProduct = false
    });
  }
}

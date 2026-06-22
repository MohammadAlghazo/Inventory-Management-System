import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Package, Edit, Trash2, ChevronLeft, ChevronRight, LayoutGrid, List, Plus, ImagePlus } from 'lucide-angular';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { ProfilePictureModalComponent } from '../../shared/components/profile-picture-modal/profile-picture-modal.component';
import { environment } from '../../../environments/environment';
import { ExportExcelService } from '../../core/services/export-excel.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';
import { SweetAlertService } from '../../core/services/sweetalert.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe, ProfilePictureModalComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent implements OnInit {
  readonly icons = { Search, Package, Edit, Trash2, ChevronLeft, ChevronRight, LayoutGrid, List, Plus, ImagePlus };

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

  showImageModal = false;
  selectedProductIdForImage: number | null = null;
  environment = environment;

  user: any;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private http: HttpClient,
    private exportExcel: ExportExcelService,
    private exportPdf: ExportPdfService,
    private sweetAlert: SweetAlertService,
    private cdr: ChangeDetectorRef
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadCategories() {
    this.http.get<any>(`${environment.apiUrl}/lookup/categories`).subscribe({
      next: (res) => { 
        this.categories = res.data || [];
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  openImageModal(p: any) {
    this.selectedProductIdForImage = p.id;
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
    this.selectedProductIdForImage = null;
  }

  onImageUploaded(url: string) {
    if (this.selectedProductIdForImage) {
      const p = this.products.find(x => x.id === this.selectedProductIdForImage);
      if (p) {
        const updatePayload = { ...p, imageUrl: url };
        this.productService.updateProduct(p.id, updatePayload).subscribe({
          next: () => {
            p.imageUrl = url;
            this.closeImageModal();
            this.cdr.markForCheck();
          },
          error: (err) => console.error('Image upload update failed:', err)
        });
      }
    }
  }

  get isAdmin() {
    const role = this.user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return role === 'SuperAdmin' || role === 'InventoryManager';
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts(this.page, this.pageSize, this.searchQuery, this.selectedCategory, this.selectedStockStatus).subscribe({
      next: (res) => {
        this.products = res.data?.items || [];
        this.totalCount = res.data?.totalCount || 0;
        this.totalPages = res.data?.totalPages || 1;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getFilteredProducts() {
    return this.products;
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
    this.exportExcel.export(dataToExport, 'Products_Report');
  }

  exportToPdf() {
    this.exportPdf.export('products-table', 'Products_Report');
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
        this.sweetAlert.success('Success', 'Product deleted successfully');
        this.loadProducts();
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.isDeleting = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Import Modal State
  showImportModal = false;
  importing = false;
  selectedImportFile: File | null = null;
  importError = '';
  importSuccess = '';

  openImportModal() {
    this.showImportModal = true;
    this.selectedImportFile = null;
    this.importError = '';
    this.importSuccess = '';
  }

  closeImportModal() {
    this.showImportModal = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImportFile = file;
    }
  }

  submitImport() {
    if (!this.selectedImportFile) return;
    this.importing = true;
    this.importError = '';
    this.importSuccess = '';
    this.productService.importProducts(this.selectedImportFile).subscribe({
      next: (res: any) => {
        this.importing = false;
        this.importSuccess = res.message || 'Import completed successfully.';
        this.loadProducts();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.importing = false;
        this.importError = err.error?.message || 'Failed to import products.';
        this.cdr.markForCheck();
      }
    });
  }

  downloadTemplate() {
    const data = [{
      'Name': 'Example Product',
      'SKU': 'PRD-001',
      'Price': 19.99,
      'PurchasePrice': 10.00,
      'Quantity': 100,
      'MinQuantity': 10,
      'Category': 'Electronics',
      'Brand': 'BrandX',
      'Unit': 'Pcs',
      'Barcode': '123456789012',
      'Description': 'This is an example product.'
    }];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Products_Import_Template.xlsx');
  }

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
        this.sweetAlert.success('Success', 'Product saved successfully');
        this.loadProducts();
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSavingProduct = false;
        this.cdr.markForCheck();
      }
    });
  }
}

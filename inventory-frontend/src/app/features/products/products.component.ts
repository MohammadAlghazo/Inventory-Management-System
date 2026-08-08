import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Package, Edit, Trash2, ChevronLeft, ChevronRight, Download, Upload, ImagePlus, LayoutGrid, List, Plus, Wand2 } from 'lucide-angular';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { LookupStateService } from '../../core/services/lookup-state.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subject, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProfilePictureModalComponent } from '../../shared/components/profile-picture-modal/profile-picture-modal.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { environment } from '../../../environments/environment';
import { ExportExcelService } from '../../core/services/export-excel.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';
import { SweetAlertService } from '../../core/services/sweetalert.service';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe, HasPermissionDirective, ProfilePictureModalComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent implements OnInit {
  readonly icons = { Search, Package, Edit, Trash2, ChevronLeft, ChevronRight, Download, Upload, ImagePlus, LayoutGrid, List, Plus, Wand2 };
  private readonly destroyRef = inject(DestroyRef);

  products: any[] = [];
  totalCount = 0;
  totalPages = 1;
  page = 1;
  searchQuery = '';
  searchSubject = new Subject<string>();
  selectedCategory = '';
  selectedStockStatus = '';
  pageSize = 15;
  /** True only on the very first load — shows skeleton rows */
  isLoading = false;
  /** True during subsequent filter/page changes — dims existing data instead of clearing it */
  isTransitioning = false;
  viewMode: 'table' | 'grid' = 'table';

  categories: any[] = [];
  suppliers: any[] = [];
  units: any[] = [];

  isDeleting = false;

  showImageModal = false;
  selectedProductIdForImage: number | null = null;
  environment = environment;

  user: any;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private lookupState: LookupStateService,
    private exportExcel: ExportExcelService,
    private exportPdf: ExportPdfService,
    private sweetAlert: SweetAlertService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadProducts();
    this.loadLookupData();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery = query;
      this.page = 1;
      this.loadProducts();
    });
  }

  /** Load all reference data in parallel using the shared LookupStateService cache */
  loadLookupData() {
    forkJoin({
      categories: this.lookupState.categories$,
      units: this.lookupState.units$,
      suppliers: this.lookupState.suppliers$
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ categories, units, suppliers }) => {
          this.categories = categories.data || [];
          this.units = units.data || [];
          this.suppliers = suppliers.data?.items || [];
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
          error: (err) => this.sweetAlert.error(
            this.translate.instant('COMMON.ERROR'),
            err.error?.message || this.translate.instant('PROFILE.PICTURE_UPDATE_FAILED')
          )
        });
      }
    }
  }

  loadProducts() {
    // First load: show full skeleton. Subsequent loads: dim existing data for smooth transition
    if (this.products.length === 0) {
      this.isLoading = true;
    } else {
      this.isTransitioning = true;
    }

    this.productService.getProducts(this.page, this.pageSize, this.searchQuery, this.selectedCategory, this.selectedStockStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.products = res.data?.items || [];
          this.totalCount = res.data?.totalCount || 0;
          this.totalPages = res.data?.totalPages || 1;
          this.isLoading = false;
          this.isTransitioning = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoading = false;
          this.isTransitioning = false;
          this.cdr.markForCheck();
        }
      });
  }

  /** Use a getter instead of a method to avoid repeated calls per render cycle */
  get filteredProducts(): any[] {
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
    this.productService.getProducts(1, 10000, this.searchQuery, this.selectedCategory, this.selectedStockStatus).subscribe({
      next: (res) => {
        const dataToExport = (res.data?.items || []).map((p: any) => ({
          'ID': p.id,
          'Name': p.name,
          'SKU': p.sku,
          'Category': p.categoryName,
          'Price': p.price,
          'Quantity': p.quantity,
          'Min Quantity': p.minQuantity,
          'Supplier': p.supplier || '—',
          'Status': p.isActive ? 'Active' : 'Inactive'
        }));
        this.exportExcel.export(dataToExport, 'Products_Report');
      }
    });
  }

  exportToPdf() {
    this.exportPdf.export('products-table', 'Products_Report');
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
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

  getPagesArray(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.page - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
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

  deleteProduct(product: any) {
    this.sweetAlert.confirmDelete(product.name).then((result) => {
      if (result.isConfirmed) {
        this.isDeleting = true;
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.isDeleting = false;
            this.sweetAlert.success(
              this.translate.instant('COMMON.SUCCESS'),
              this.translate.instant('PRODUCTS.DELETE_SUCCESS')
            );
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
        this.importSuccess = res.message || this.translate.instant('PRODUCTS.IMPORT_SUCCESS');
        this.loadProducts();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.importing = false;
        this.importError = err.error?.message || this.translate.instant('PRODUCTS.IMPORT_FAILED');
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
    name: '', sku: '', categoryId: null, unitId: null, price: 0, minQuantity: 0, supplierId: null, description: ''
  };

  openAddProduct() {
    this.editProduct = null;
    this.productForm = { name: '', sku: '', categoryId: null, unitId: null, price: 0, minQuantity: 0, supplierId: null, description: '' };
    this.showProductModal = true;
  }

  openEditProduct(product: any) {
    this.editProduct = product;
    this.productForm = {
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      unitId: product.unitId || null,
      price: product.price,
      minQuantity: product.minQuantity,
      supplierId: product.supplierId,
      description: product.description || ''
    };
    this.showProductModal = true;
  }

  generateSKU() {
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomNums = Math.floor(1000 + Math.random() * 9000);
    this.productForm.sku = `PRD-${randomChars}-${randomNums}`;
  }

  submitProduct() {
    if (!this.productForm.name?.trim()) {
      this.sweetAlert.error(this.translate.instant('COMMON.VALIDATION_ERROR'), this.translate.instant('PRODUCTS.NAME_REQUIRED'));
      return;
    }
    if (!this.productForm.sku?.trim()) {
      this.sweetAlert.error(this.translate.instant('COMMON.VALIDATION_ERROR'), this.translate.instant('PRODUCTS.SKU_REQUIRED'));
      return;
    }
    if (!this.productForm.price || Number(this.productForm.price) <= 0) {
      this.sweetAlert.error(this.translate.instant('COMMON.VALIDATION_ERROR'), this.translate.instant('PRODUCTS.PRICE_POSITIVE'));
      return;
    }
    this.isSavingProduct = true;
    const payload = {
      name: this.productForm.name.trim(),
      sku: this.productForm.sku.trim(),
      categoryId: this.productForm.categoryId ? Number(this.productForm.categoryId) : null,
      price: Number(this.productForm.price),
      unitId: this.productForm.unitId ? Number(this.productForm.unitId) : null,
      minQuantity: Number(this.productForm.minQuantity) || 0,
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
        this.sweetAlert.success(
          this.translate.instant('COMMON.SUCCESS'),
          this.translate.instant(this.editProduct ? 'PRODUCTS.UPDATE_SUCCESS' : 'PRODUCTS.CREATE_SUCCESS')
        );
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

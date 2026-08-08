import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Download, Plus, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-angular';
import { InventoryService } from '../../core/services/inventory.service';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { LookupStateService } from '../../core/services/lookup-state.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ExportExcelService } from '../../core/services/export-excel.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';
import { environment } from '../../../environments/environment';
import { SweetAlertService } from '../../core/services/sweetalert.service';
import { Html5Qrcode } from 'html5-qrcode';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe, HasPermissionDirective],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryComponent implements OnInit, OnDestroy {
  readonly icons = { Search, Download, Plus, ClipboardList, ChevronLeft, ChevronRight };

  logs: any[] = [];
  products: any[] = [];
  totalCount = 0;
  totalPages = 1;
  page = 1;
  pageSize = 15;
  actionFilter = '';
  searchQuery = '';
  searchSubject = new Subject<string>();
  isLoading = false;
  isTransitioning = false;
  private readonly destroyRef = inject(DestroyRef);

  user: any;

  actionModal: 'add' | 'sell' | 'adjust' | 'return' | 'transfer' | null = null;
  isSubmitting = false;
  actionError = '';

  selectedProductId: number | '' = '';
  selectedWarehouseId: number | '' = '';
  destinationWarehouseId: number | '' = '';
  quantity: number = 1;
  notes: string = '';

  warehouses: any[] = [];

  constructor(
    private inventoryService: InventoryService,
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
    this.loadLogs();
    this.loadProducts();
    this.loadWarehouses();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.page = 1;
      this.loadLogs();
    });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
    if (this.scanning && this.qrReader) {
      try {
        this.qrReader.stop().catch(() => {});
      } catch (e) {}
    }
  }

  loadWarehouses() {
    this.lookupState.warehouses$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.warehouses = res.data || [];
        this.cdr.markForCheck();
      }
    });
  }

  loadLogs() {
    // First load: show skeleton. Subsequent filter/page changes: dim existing rows
    if (this.logs.length === 0) {
      this.isLoading = true;
    } else {
      this.isTransitioning = true;
    }

    this.inventoryService.getInventoryLogs(this.page, this.pageSize, this.actionFilter, this.searchQuery)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.logs = res.data?.items || [];
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

  get filteredLogs(): any[] {
    return this.logs;
  }

  onFilterChange() {
    this.page = 1;
    this.loadLogs();
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  onPageSizeChange() {
    this.page = 1;
    this.loadLogs();
  }

  loadProducts() {
    
    this.productService.getProducts(1, 1000).subscribe(res => {
      this.products = res.data?.items || [];
      this.cdr.markForCheck();
    });
  }

  filterByAction(action: string) {
    this.actionFilter = action;
    this.page = 1;
    this.loadLogs();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadLogs();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadLogs();
    }
  }

  goToPage(pg: number) {
    this.page = pg;
    this.loadLogs();
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

  openActionModal(action: 'add' | 'sell' | 'adjust' | 'return' | 'transfer') {
    this.actionModal = action;
    this.selectedProductId = '';
    this.selectedWarehouseId = '';
    this.destinationWarehouseId = '';
    this.quantity = action === 'adjust' ? 0 : 1;
    this.notes = '';
    this.actionError = '';
  }

  scanning = false;
  scanFeedback = '';
  qrReader: any = null;

  toggleScanner() {
    if (this.scanning) {
      this.stopScanner();
    } else {
      this.startScanner();
    }
  }

  startScanner() {
    this.scanning = true;
    this.scanFeedback = '';
    this.cdr.markForCheck();

    setTimeout(() => {
      this.qrReader = new Html5Qrcode('barcode-reader-elem');
      this.qrReader.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 }
        },
        (decodedText: string) => {
          this.scanFeedback = decodedText;
          this.cdr.markForCheck();

          this.inventoryService.searchByBarcode(decodedText).subscribe({
            next: (res) => {
              const matched = res.data;
              if (matched) {
                this.selectedProductId = matched.id;
                this.scanFeedback = matched.name;
                this.cdr.markForCheck();
                
                setTimeout(() => {
                  this.stopScanner();
                }, 1500);
              } else {
                this.scanFeedback = this.translate.instant('INVENTORY.CODE_NOT_MATCHED');
                this.cdr.markForCheck();
              }
            },
            error: () => {
              this.scanFeedback = this.translate.instant('INVENTORY.CODE_NOT_MATCHED');
              this.cdr.markForCheck();
            }
          });
        },
        (errorMessage: string) => {
          // Silent
        }
      ).catch((err: any) => {
        console.error('Error starting scanner:', err);
        this.scanFeedback = this.translate.instant('INVENTORY.CAMERA_ERROR');
        this.cdr.markForCheck();
      });
    }, 100);
  }

  stopScanner() {
    if (this.qrReader) {
      this.qrReader.stop().then(() => {
        this.scanning = false;
        this.scanFeedback = '';
        this.qrReader = null;
        this.cdr.markForCheck();
      }).catch((err: any) => {
        console.error('Error stopping scanner:', err);
        this.scanning = false;
        this.scanFeedback = '';
        this.qrReader = null;
        this.cdr.markForCheck();
      });
    } else {
      this.scanning = false;
      this.scanFeedback = '';
      this.cdr.markForCheck();
    }
  }

  closeActionModal() {
    this.stopScanner();
    this.actionModal = null;
  }

  getModalTitle() {
    switch (this.actionModal) {
      case 'add': return 'INVENTORY.ADD_STOCK';
      case 'sell': return 'INVENTORY.SELL_STOCK';
      case 'adjust': return 'INVENTORY.ADJUST_STOCK';
      case 'return': return 'INVENTORY.RETURN_STOCK';
      case 'transfer': return 'INVENTORY.TRANSFER_STOCK';
      default: return '';
    }
  }

  getQtyLabel() {
    switch (this.actionModal) {
      case 'add': return 'INVENTORY.QTY_TO_ADD';
      case 'sell': return 'INVENTORY.QTY_TO_SELL';
      case 'adjust': return 'INVENTORY.NEW_QTY';
      case 'return': return 'INVENTORY.QTY_TO_RETURN';
      case 'transfer': return 'INVENTORY.TRANSFER_QTY';
      default: return 'INVENTORY.QUANTITY_LABEL';
    }
  }

  getActionLabel(action: string) {
    const key = action?.toUpperCase();
    return ['ADD', 'SELL', 'ADJUST', 'RETURN', 'TRANSFER'].includes(key)
      ? `INVENTORY.${key}`
      : action;
  }

  submitAction() {
    if (!this.selectedProductId) {
      this.sweetAlert.error(this.translate.instant('COMMON.VALIDATION_ERROR'), this.translate.instant('INVENTORY.SELECT_PRODUCT_ERROR'));
      return;
    }
    if (this.quantity === null || this.quantity === undefined || this.quantity < 0) {
      this.sweetAlert.error(this.translate.instant('COMMON.VALIDATION_ERROR'), this.translate.instant('INVENTORY.NEGATIVE_QUANTITY_ERROR'));
      return;
    }
    if (this.actionModal !== 'adjust' && this.quantity <= 0) {
      this.sweetAlert.error(this.translate.instant('COMMON.VALIDATION_ERROR'), this.translate.instant('INVENTORY.POSITIVE_QUANTITY_ERROR'));
      return;
    }
    
    this.isSubmitting = true;
    this.actionError = '';

    const payload = {
      productId: Number(this.selectedProductId),
      warehouseId: this.selectedWarehouseId ? Number(this.selectedWarehouseId) : null,
      quantity: this.quantity,
      notes: this.notes
    };

    let actionObs;
    switch (this.actionModal) {
      case 'add': 
        actionObs = this.inventoryService.addStock({
          productId: payload.productId, warehouseId: payload.warehouseId, quantityToAdd: payload.quantity, notes: payload.notes
        }); 
        break;
      case 'sell': 
        actionObs = this.inventoryService.sellStock({
          productId: payload.productId, warehouseId: payload.warehouseId, quantityToSell: payload.quantity, notes: payload.notes
        }); 
        break;
      case 'adjust': 
        actionObs = this.inventoryService.adjustStock({
          productId: payload.productId, warehouseId: payload.warehouseId, newQuantity: payload.quantity, notes: payload.notes
        }); 
        break;
      case 'return': 
        actionObs = this.inventoryService.returnStock({
          productId: payload.productId, warehouseId: payload.warehouseId, quantityToReturn: payload.quantity, notes: payload.notes
        }); 
        break;
      case 'transfer':
        if (!this.destinationWarehouseId) {
          this.sweetAlert.error(this.translate.instant('COMMON.VALIDATION_ERROR'), this.translate.instant('INVENTORY.SELECT_DESTINATION_ERROR'));
          this.isSubmitting = false;
          return;
        }
        actionObs = this.inventoryService.transferStock({
          productId: payload.productId, sourceWarehouseId: payload.warehouseId, destinationWarehouseId: Number(this.destinationWarehouseId), quantity: payload.quantity, notes: payload.notes
        });
        break;
    }

    if (!actionObs) return;

    actionObs.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeActionModal();
        this.sweetAlert.success(this.translate.instant('COMMON.SUCCESS'), this.translate.instant('INVENTORY.ACTION_COMPLETED'));
        this.loadLogs();
        this.loadProducts(); 
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.actionError = err.error?.message || this.translate.instant('INVENTORY.OPERATION_FAILED');
        this.cdr.markForCheck();
      }
    });
  }

  exportToExcel() {
    this.inventoryService.getInventoryLogs(1, 10000, '', this.searchQuery).subscribe({
      next: (res: any) => {
        const dataToExport = (res.data?.items || []).map((log: any) => ({
          'ID': log.id,
          'Date': new Date(log.actionDate).toLocaleString(),
          'Product Name': log.productName,
          'Action': log.action,
          'Previous Qty': log.previousQuantity,
          'Qty Change': log.quantityChanged,
          'New Qty': log.newQuantity,
          'Performed By': log.performedBy || log.userName || 'N/A',
          'Notes': log.notes || 'N/A'
        }));
        this.exportExcel.export(dataToExport, 'Inventory_Logs');
      }
    });
  }

  exportToPdf() {
    this.exportPdf.export('inventory-table', 'Inventory_Logs_Report');
  }
}

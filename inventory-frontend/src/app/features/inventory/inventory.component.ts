import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Download, Plus, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-angular';
import { InventoryService } from '../../core/services/inventory.service';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ExportExcelService } from '../../core/services/export-excel.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {
  readonly icons = { Search, Download, Plus, ClipboardList, ChevronLeft, ChevronRight };

  logs: any[] = [];
  products: any[] = [];
  totalCount = 0;
  totalPages = 1;
  page = 1;
  pageSize = 15;
  actionFilter = '';
  searchQuery = '';
  isLoading = false;

  user: any;

  // Action Modal
  actionModal: 'add' | 'sell' | 'adjust' | 'return' | null = null;
  isSubmitting = false;
  actionError = '';
  
  // Form state
  selectedProductId: number | '' = '';
  quantity: number = 1;
  notes: string = '';

  constructor(
    private inventoryService: InventoryService,
    private productService: ProductService,
    private authService: AuthService,
    private exportExcel: ExportExcelService,
    private exportPdf: ExportPdfService
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadLogs();
    this.loadProducts();
  }

  get isAdmin() {
    return this.user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Manager';
  }

  loadLogs() {
    this.isLoading = true;
    this.inventoryService.getInventoryLogs(this.page, this.pageSize, this.actionFilter).subscribe({
      next: (res) => {
        this.logs = res.data?.items || [];
        this.totalCount = res.data?.totalCount || 0;
        this.totalPages = res.data?.totalPages || 1;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getFilteredLogs() {
    const q = this.searchQuery.trim().toLowerCase();
    return this.logs.filter(log => {
      return q ? (
        String(log.id).includes(q) ||
        (log.productName && log.productName.toLowerCase().includes(q)) ||
        (log.notes && log.notes.toLowerCase().includes(q)) ||
        (log.performedBy && log.performedBy.toLowerCase().includes(q)) ||
        (log.userName && log.userName.toLowerCase().includes(q))
      ) : true;
    });
  }

  onFilterChange() {
    this.page = 1;
    this.loadLogs();
  }

  onPageSizeChange() {
    this.page = 1;
    this.loadLogs();
  }

  loadProducts() {
    // Get all products for the dropdown (assuming page 1 with high pageSize or backend supports no pagination)
    this.productService.getProducts(1, 1000).subscribe(res => {
      this.products = res.data?.items || [];
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

  getPagesArray() {
    const pages = [];
    const maxPages = Math.min(this.totalPages, 5);
    for (let i = 1; i <= maxPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  openActionModal(action: 'add' | 'sell' | 'adjust' | 'return') {
    this.actionModal = action;
    this.selectedProductId = '';
    this.quantity = action === 'adjust' ? 0 : 1;
    this.notes = '';
    this.actionError = '';
  }

  closeActionModal() {
    this.actionModal = null;
  }

  getModalTitle() {
    switch (this.actionModal) {
      case 'add': return 'INVENTORY.ADD_STOCK';
      case 'sell': return 'INVENTORY.SELL_STOCK';
      case 'adjust': return 'INVENTORY.ADJUST_STOCK';
      case 'return': return 'INVENTORY.RETURN_STOCK';
      default: return '';
    }
  }

  getQtyLabel() {
    switch (this.actionModal) {
      case 'add': return 'INVENTORY.QTY_TO_ADD';
      case 'sell': return 'INVENTORY.QTY_TO_SELL';
      case 'adjust': return 'INVENTORY.NEW_QTY';
      case 'return': return 'INVENTORY.QTY_TO_RETURN';
      default: return 'INVENTORY.QUANTITY_LABEL';
    }
  }

  submitAction() {
    if (!this.selectedProductId) return;
    
    this.isSubmitting = true;
    this.actionError = '';

    const payload = {
      productId: Number(this.selectedProductId),
      quantity: this.quantity,
      notes: this.notes
    };

    let actionObs;
    switch (this.actionModal) {
      case 'add': actionObs = this.inventoryService.addStock(payload); break;
      case 'sell': actionObs = this.inventoryService.sellStock(payload); break;
      case 'adjust': 
        actionObs = this.inventoryService.adjustStock({
          productId: payload.productId, 
          newQuantity: payload.quantity, 
          notes: payload.notes
        }); 
        break;
      case 'return': actionObs = this.inventoryService.returnStock(payload); break;
    }

    if (!actionObs) return;

    actionObs.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeActionModal();
        this.loadLogs();
        this.loadProducts(); // Update stock in dropdown
      },
      error: (err) => {
        this.isSubmitting = false;
        this.actionError = err.error?.message || 'Operation failed. Please try again.';
      }
    });
  }

  exportToExcel() {
    const dataToExport = this.getFilteredLogs().map(log => ({
      'ID': log.id,
      'Date': new Date(log.actionDate).toLocaleString(),
      'Product Name': log.productName,
      'Action': log.action,
      'Previous Qty': log.previousQuantity,
      'Qty Change': log.quantityChanged,
      'New Qty': log.newQuantity,
      'Performed By': log.performedBy || log.userName || '—',
      'Notes': log.notes || '—'
    }));
    this.exportExcel.export(dataToExport, 'Inventory_Logs_Report');
  }

  exportToPdf() {
    this.exportPdf.export('inventory-table', 'Inventory_Logs_Report');
  }
}

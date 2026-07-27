import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseOrderService } from '../../core/services/purchase-order.service';
import { PurchaseOrder, CreatePurchaseOrderDto } from '../../core/models/purchase-order.model';
import { SweetAlertService } from '../../core/services/sweetalert.service';
import { LookupService } from '../../core/services/lookup.service';
import { SupplierService } from '../../core/services/supplier.service';
import { ProductService } from '../../core/services/product.service';
import { LucideAngularModule, Plus, Search, FileText, CheckCircle, Package, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ExportExcelService } from '../../core/services/export-excel.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe, SpinnerComponent],
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.css']
})
export class PurchaseOrdersComponent implements OnInit, OnDestroy {
  orders: PurchaseOrder[] = [];
  searchTerm: string = '';
  searchSubject = new Subject<string>();
  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  submitting: boolean = false;
  loading: boolean = false;

  // Create Modal State
  showCreateModal = false;
  suppliers: any[] = [];
  warehouses: any[] = [];
  products: any[] = [];
  
  newOrder: CreatePurchaseOrderDto = {
    supplierId: 0,
    warehouseId: 0,
    expectedDate: '',
    items: []
  };

  // Receive Modal State
  showReceiveModal = false;
  receivingOrder: PurchaseOrder | null = null;
  receiveDto: any = { purchaseOrderId: 0, notes: '', items: [] };
  
  // Icons
  PlusIcon = Plus;
  SearchIcon = Search;
  FileTextIcon = FileText;
  CheckCircleIcon = CheckCircle;
  PackageIcon = Package;
  XIcon = X;
  Trash2Icon = Trash2;
  ChevronLeftIcon = ChevronLeft;
  ChevronRightIcon = ChevronRight;

  constructor(
    private poService: PurchaseOrderService,
    private lookupService: LookupService,
    private supplierService: SupplierService,
    private productService: ProductService,
    private sweetAlert: SweetAlertService,
    private exportExcel: ExportExcelService,
    private exportPdf: ExportPdfService
  ) {}

  ngOnInit(): void {
    this.loadOrders();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchTerm = query;
      this.currentPage = 1;
      this.loadOrders();
    });
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  loadOrders(): void {
    this.loading = true;
    this.poService.getPurchaseOrders(this.currentPage, this.pageSize, this.searchTerm)
      .subscribe({
        next: (res: any) => {
          this.orders = res.data?.items || [];
          this.totalCount = res.data?.totalCount || 0;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  exportToExcel() {
    this.poService.getPurchaseOrders(1, 10000, this.searchTerm).subscribe({
      next: (res: any) => {
        const dataToExport = (res.data?.items || []).map((o: any) => ({
          'Order #': o.orderNumber,
          'Supplier': o.supplierName,
          'Warehouse': o.warehouseName,
          'Date': o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '',
          'Total': o.totalAmount,
          'Status': o.status
        }));
        this.exportExcel.export(dataToExport, 'Purchase_Orders_Report');
      }
    });
  }

  exportToPdf() {
    this.exportPdf.export('purchase-orders-table', 'Purchase_Orders_Report');
  }

  onSearch(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  openReceiveModal(order: PurchaseOrder): void {
    this.receivingOrder = order;
    this.receiveDto = {
      purchaseOrderId: order.id,
      notes: '',
      items: order.items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        quantityOrdered: i.quantityOrdered,
        quantityReceived: Math.max(0, i.quantityOrdered - i.quantityReceived)
      }))
    };
    this.showReceiveModal = true;
  }

  closeReceiveModal(): void {
    this.showReceiveModal = false;
    this.receivingOrder = null;
  }

  submitReceiveOrder(): void {
    if (!this.receivingOrder) return;
    
    // Filter out items with 0 received quantity (unless that's allowed, but usually we only send what's received)
    // Actually the backend expects items to update. If we send 0, it adds 0. Let's send all mapped items.
    const payload = {
      purchaseOrderId: this.receiveDto.purchaseOrderId,
      notes: this.receiveDto.notes,
      items: this.receiveDto.items.map((i: any) => ({
        productId: i.productId,
        quantityReceived: i.quantityReceived
      }))
    };

    this.submitting = true;
    this.poService.receivePurchaseOrder(this.receivingOrder.id, payload)
      .subscribe({
        next: () => {
          this.submitting = false;
          this.sweetAlert.success('Purchase Order Received Successfully', 'Inventory has been updated.');
          this.closeReceiveModal();
          this.loadOrders();
        },
        error: (err) => {
          this.submitting = false;
          // Handled by interceptor
        }
      });
  }

  getStatusClass(status: string): string {
    switch(status?.toLowerCase()) {
      case 'draft': return 'badge-secondary';
      case 'completed': return 'badge-success';
      case 'received': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      case 'pending': return 'badge-warning';
      default: return 'badge-info';
    }
  }

  // --- Create PO Flow ---

  openCreateModal(): void {
    this.showCreateModal = true;
    this.newOrder = { supplierId: 0, warehouseId: 0, expectedDate: '', items: [] };
    this.loadDropdowns();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  loadDropdowns(): void {
    if (this.suppliers.length === 0) {
      this.supplierService.getAll(1, 100).subscribe(res => this.suppliers = res.data?.items || []);
    }
    if (this.warehouses.length === 0) {
      this.lookupService.getWarehouses().subscribe(res => this.warehouses = res.data || []);
    }
    if (this.products.length === 0) {
      this.productService.getProducts(1, 1000).subscribe(res => this.products = res.data?.items || []);
    }
  }

  addItem(): void {
    this.newOrder.items.push({ productId: 0, quantity: 1, unitCost: 0 });
  }

  removeItem(index: number): void {
    this.newOrder.items.splice(index, 1);
  }

  onProductSelect(item: any, productId: string): void {
    const pId = Number(productId);
    item.productId = pId;
    const product = this.products.find(p => p.id === pId);
    if (product) {
      item.unitCost = product.purchasePrice || product.price || 0;
    }
  }

  submitCreatePO(): void {
    const sId = Number(this.newOrder.supplierId);
    const wId = Number(this.newOrder.warehouseId);
    
    if (!sId || !wId || this.newOrder.items.length === 0) {
      this.sweetAlert.error('Validation Error', 'Please select supplier, warehouse, and add at least one item.');
      return;
    }

    const hasInvalidItems = this.newOrder.items.some((i: any) => !i.productId || i.productId <= 0);
    if (hasInvalidItems) {
      this.sweetAlert.error('Validation Error', 'Please select a product for all order items.');
      return;
    }

    // Clean up empty items (though validated above)
    this.newOrder.items = this.newOrder.items.filter((i: any) => i.productId > 0 && i.quantity > 0);
    
    this.newOrder.supplierId = sId;
    this.newOrder.warehouseId = wId;

    if (!this.newOrder.expectedDate) {
      this.newOrder.expectedDate = undefined;
    }

    this.submitting = true;
    this.poService.createPurchaseOrder(this.newOrder).subscribe({
      next: () => {
        this.submitting = false;
        this.sweetAlert.success('Success', 'Purchase Order created successfully');
        this.closeCreateModal();
        this.loadOrders();
      },
      error: (err) => {
        this.submitting = false;
        // Handled by interceptor
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  goToPage(pg: number): void {
    this.currentPage = pg;
    this.loadOrders();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  getPagesArray(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
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
}

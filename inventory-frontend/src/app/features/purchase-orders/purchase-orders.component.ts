import { Component, OnInit } from '@angular/core';
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

import { ExportExcelService } from '../../core/services/export-excel.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.css']
})
export class PurchaseOrdersComponent implements OnInit {
  orders: PurchaseOrder[] = [];
  searchTerm: string = '';
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
          this.sweetAlert.error('Error loading purchase orders');
          console.error(err);
          this.loading = false;
        }
      });
  }

  exportToExcel() {
    const dataToExport = this.orders.map(o => ({
      'Order #': o.orderNumber,
      'Supplier': o.supplierName,
      'Warehouse': o.warehouseName,
      'Date': o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '',
      'Total': o.totalAmount,
      'Status': o.status
    }));
    this.exportExcel.export(dataToExport, 'Purchase_Orders_Report');
  }

  exportToPdf() {
    this.exportPdf.export('purchase-orders-table', 'Purchase_Orders_Report');
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
    this.loadOrders();
  }

  receiveOrder(id: number): void {
    this.poService.receivePurchaseOrder(id, { purchaseOrderId: id, notes: 'Received via portal' })
      .subscribe({
        next: () => {
          this.sweetAlert.success('Purchase Order Received Successfully', 'Inventory has been updated.');
          this.loadOrders();
        },
        error: (err) => {
          this.sweetAlert.error('Failed to receive order', err.error?.message || 'An error occurred');
        }
      });
  }

  getStatusClass(status: string): string {
    switch(status?.toLowerCase()) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
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
      item.unitCost = product.price; // Or whatever default cost makes sense
    }
  }

  submitCreatePO(): void {
    const sId = Number(this.newOrder.supplierId);
    const wId = Number(this.newOrder.warehouseId);
    
    if (!sId || !wId || this.newOrder.items.length === 0) {
      this.sweetAlert.error('Validation Error', 'Please select supplier, warehouse, and add at least one item.');
      return;
    }

    // Clean up empty items
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
        this.sweetAlert.error('Error', err.error?.message || 'Failed to create PO');
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
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}

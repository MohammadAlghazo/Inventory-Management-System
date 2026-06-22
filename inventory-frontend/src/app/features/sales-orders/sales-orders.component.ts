import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesOrderService } from '../../core/services/sales-order.service';
import { SalesOrder, CreateSalesOrderDto } from '../../core/models/sales-order.model';
import { SweetAlertService } from '../../core/services/sweetalert.service';
import { LookupService } from '../../core/services/lookup.service';
import { CustomerService } from '../../core/services/customer.service';
import { ProductService } from '../../core/services/product.service';
import { LucideAngularModule, Plus, Search, FileText, CheckCircle, Truck, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';

import { ExportExcelService } from '../../core/services/export-excel.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';

@Component({
  selector: 'app-sales-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './sales-orders.component.html',
  styleUrls: ['./sales-orders.component.css']
})
export class SalesOrdersComponent implements OnInit {
  orders: SalesOrder[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  submitting: boolean = false;
  loading: boolean = false;

  // Create Modal State
  showCreateModal = false;
  customers: any[] = [];
  warehouses: any[] = [];
  products: any[] = [];
  
  newOrder: CreateSalesOrderDto = {
    customerId: 0,
    warehouseId: 0,
    expectedShipDate: '',
    items: []
  };
  
  // Icons
  PlusIcon = Plus;
  SearchIcon = Search;
  FileTextIcon = FileText;
  CheckCircleIcon = CheckCircle;
  TruckIcon = Truck;
  XIcon = X;
  Trash2Icon = Trash2;
  ChevronLeftIcon = ChevronLeft;
  ChevronRightIcon = ChevronRight;

  constructor(
    private soService: SalesOrderService,
    private lookupService: LookupService,
    private customerService: CustomerService,
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
    this.soService.getSalesOrders(this.currentPage, this.pageSize, this.searchTerm)
      .subscribe({
        next: (res: any) => {
          this.orders = res.data?.items || [];
          this.totalCount = res.data?.totalCount || 0;
          this.loading = false;
        },
        error: (err) => {
          this.sweetAlert.error('Error loading sales orders');
          console.error(err);
          this.loading = false;
        }
      });
  }

  exportToExcel() {
    const dataToExport = this.orders.map(o => ({
      'Order #': o.orderNumber,
      'Customer': o.customerName,
      'Warehouse': o.warehouseName,
      'Date': o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '',
      'Total': o.totalAmount,
      'Status': o.status
    }));
    this.exportExcel.export(dataToExport, 'Sales_Orders_Report');
  }

  exportToPdf() {
    this.exportPdf.export('sales-orders-table', 'Sales_Orders_Report');
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
    this.loadOrders();
  }

  shipOrder(id: number): void {
    this.soService.shipSalesOrder(id, { salesOrderId: id, trackingNumber: 'TRK-' + id, notes: 'Shipped from portal' })
      .subscribe({
        next: () => {
          this.sweetAlert.success('Sales Order Shipped Successfully', 'Inventory has been deducted.');
          this.loadOrders();
        },
        error: (err) => {
          this.sweetAlert.error('Failed to ship order', err.error?.message || 'An error occurred');
        }
      });
  }

  getStatusClass(status: string): string {
    switch(status?.toLowerCase()) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }

  // --- Create SO Flow ---

  openCreateModal(): void {
    this.showCreateModal = true;
    this.newOrder = { customerId: 0, warehouseId: 0, expectedShipDate: '', items: [] };
    this.loadDropdowns();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  loadDropdowns(): void {
    if (this.customers.length === 0) {
      this.customerService.getAll(1, 100).subscribe(res => this.customers = res.data?.items || []);
    }
    if (this.warehouses.length === 0) {
      this.lookupService.getWarehouses().subscribe(res => this.warehouses = res.data || []);
    }
    if (this.products.length === 0) {
      this.productService.getProducts(1, 1000).subscribe(res => this.products = res.data?.items || []);
    }
  }

  addItem(): void {
    this.newOrder.items.push({ productId: 0, quantity: 1, unitPrice: 0, discount: 0 });
  }

  removeItem(index: number): void {
    this.newOrder.items.splice(index, 1);
  }

  onProductSelect(item: any, productId: string): void {
    const pId = Number(productId);
    item.productId = pId;
    const product = this.products.find(p => p.id === pId);
    if (product) {
      item.unitPrice = product.price;
    }
  }

  submitCreateSO(): void {
    const cId = Number(this.newOrder.customerId);
    const wId = Number(this.newOrder.warehouseId);

    if (!cId || !wId || this.newOrder.items.length === 0) {
      this.sweetAlert.error('Validation Error', 'Please select customer, warehouse, and add at least one item.');
      return;
    }

    // Clean up empty items
    this.newOrder.items = this.newOrder.items.filter((i: any) => i.productId > 0 && i.quantity > 0);

    this.newOrder.customerId = cId;
    this.newOrder.warehouseId = wId;

    if (!this.newOrder.expectedShipDate) {
      this.newOrder.expectedShipDate = undefined;
    }

    this.submitting = true;
    this.soService.createSalesOrder(this.newOrder).subscribe({
      next: () => {
        this.submitting = false;
        this.sweetAlert.success('Success', 'Sales Order created successfully');
        this.closeCreateModal();
        this.loadOrders();
      },
      error: (err) => {
        this.submitting = false;
        this.sweetAlert.error('Error', err.error?.message || 'Failed to create SO');
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

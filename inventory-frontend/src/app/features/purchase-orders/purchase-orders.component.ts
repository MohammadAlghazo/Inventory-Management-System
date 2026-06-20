import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseOrderService } from '../../core/services/purchase-order.service';
import { PurchaseOrder, CreatePurchaseOrderDto } from '../../core/models/purchase-order.model';
import { SweetAlertService } from '../../core/services/sweetalert.service';
import { LookupService } from '../../core/services/lookup.service';
import { SupplierService } from '../../core/services/supplier.service';
import { ProductService } from '../../core/services/product.service';
import { LucideAngularModule, Plus, Search, FileText, CheckCircle, Package, X, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.css']
})
export class PurchaseOrdersComponent implements OnInit {
  orders: PurchaseOrder[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;

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

  constructor(
    private poService: PurchaseOrderService,
    private lookupService: LookupService,
    private supplierService: SupplierService,
    private productService: ProductService,
    private sweetAlert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.poService.getPurchaseOrders(this.currentPage, this.pageSize, this.searchTerm)
      .subscribe({
        next: (res: any) => {
          this.orders = res.items || [];
          this.totalCount = res.totalCount || 0;
        },
        error: (err) => {
          this.sweetAlert.error('Error loading purchase orders');
          console.error(err);
        }
      });
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
    if (!this.newOrder.supplierId || !this.newOrder.warehouseId || this.newOrder.items.length === 0) {
      this.sweetAlert.error('Validation Error', 'Please select supplier, warehouse, and add at least one item.');
      return;
    }

    // Clean up empty items
    this.newOrder.items = this.newOrder.items.filter((i: any) => i.productId > 0 && i.quantity > 0);

    this.poService.createPurchaseOrder(this.newOrder).subscribe({
      next: () => {
        this.sweetAlert.success('Success', 'Purchase Order created successfully');
        this.closeCreateModal();
        this.loadOrders();
      },
      error: (err) => {
        this.sweetAlert.error('Error', err.error?.message || 'Failed to create PO');
      }
    });
  }
}

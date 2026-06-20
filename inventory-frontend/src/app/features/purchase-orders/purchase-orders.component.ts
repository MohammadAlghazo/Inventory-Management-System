import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseOrderService } from '../../core/services/purchase-order.service';
import { PurchaseOrder } from '../../core/models/purchase-order.model';
import { SweetAlertService } from '../../core/services/sweetalert.service';
import { LucideAngularModule, Plus, Search, FileText, CheckCircle, Package } from 'lucide-angular';

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
  
  // Icons
  PlusIcon = Plus;
  SearchIcon = Search;
  FileTextIcon = FileText;
  CheckCircleIcon = CheckCircle;
  PackageIcon = Package;

  constructor(
    private poService: PurchaseOrderService,
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
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesOrderService } from '../../core/services/sales-order.service';
import { SalesOrder } from '../../core/models/sales-order.model';
import { SweetAlertService } from '../../core/services/sweetalert.service';
import { LucideAngularModule, Plus, Search, FileText, CheckCircle, Truck } from 'lucide-angular';

@Component({
  selector: 'app-sales-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './sales-orders.component.html',
  styleUrls: ['./sales-orders.component.css']
})
export class SalesOrdersComponent implements OnInit {
  orders: SalesOrder[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  
  // Icons
  PlusIcon = Plus;
  SearchIcon = Search;
  FileTextIcon = FileText;
  CheckCircleIcon = CheckCircle;
  TruckIcon = Truck;

  constructor(
    private soService: SalesOrderService,
    private sweetAlert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.soService.getSalesOrders(this.currentPage, this.pageSize, this.searchTerm)
      .subscribe({
        next: (res: any) => {
          this.orders = res.items || [];
          this.totalCount = res.totalCount || 0;
        },
        error: (err) => {
          this.sweetAlert.error('Error loading sales orders');
          console.error(err);
        }
      });
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
}

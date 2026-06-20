import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-angular';
import { CustomerService, Customer, ApiResponse } from '../../core/services/customer.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ExportExcelService } from '../../core/services/export-excel.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './customers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  searchQuery = '';
  selectedStatus = '';
  page = 1;
  pageSize = 10;
  totalPages = 1;
  isLoading = true;
  error = '';

  iconPlus = Plus;
  iconEdit = Edit2;
  iconTrash = Trash2;
  iconSearch = Search;
  iconChevronLeft = ChevronLeft;
  iconChevronRight = ChevronRight;

  showModal = false;
  editingCustomer: Customer | null = null;
  customerForm: Partial<Customer> = {
    name: '',
    phone: '',
    email: '',
    address: '',
    isActive: true
  };

  constructor(
    private customerService: CustomerService,
    private exportExcel: ExportExcelService,
    private exportPdf: ExportPdfService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.user = this.authService.getCurrentUser();
  }

  user: any;

  get isAdmin() {
    return this.user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Manager';
  }

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.isLoading = true;
    this.customerService.getAll(this.page, this.pageSize, this.searchQuery).subscribe({
      next: (res: any) => {
        let items = res?.data?.items || [];
        
        if (this.selectedStatus === 'active') {
          items = items.filter((c: any) => c.isActive === true);
        } else if (this.selectedStatus === 'inactive') {
          items = items.filter((c: any) => c.isActive === false);
        }
        
        this.customers = items;
        this.totalPages = Math.ceil((res?.data?.totalCount || 0) / this.pageSize) || 1;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.error = 'Failed to load customers';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  filterCustomers() {
    this.page = 1;
    this.loadCustomers();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadCustomers();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadCustomers();
    }
  }

  goToPage(pg: number) {
    this.page = pg;
    this.loadCustomers();
  }

  onPageSizeChange() {
    this.page = 1;
    this.loadCustomers();
  }

  getPagesArray() {
    const pages = [];
    const maxPages = Math.min(this.totalPages, 5);
    for (let i = 1; i <= maxPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  exportToExcel() {
    const dataToExport = this.customers.map(c => ({
      'ID': c.id,
      'Name': c.name,
      'Phone': c.phone || '—',
      'Email': c.email || '—',
      'Address': c.address || '—',
      'Status': c.isActive ? 'Active' : 'Inactive'
    }));
    this.exportExcel.export(dataToExport, 'Customers_Report');
  }

  exportToPdf() {
    this.exportPdf.export('customers-table', 'Customers_Report');
  }

  openModal(customer?: Customer) {
    if (customer) {
      this.editingCustomer = customer;
      this.customerForm = { ...customer };
    } else {
      this.editingCustomer = null;
      this.customerForm = { name: '', phone: '', email: '', address: '', isActive: true };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveCustomer() {
    if (this.editingCustomer) {
      this.customerService.update(this.editingCustomer.id!, this.customerForm).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.error = 'Failed to update customer';
          this.cdr.markForCheck();
        }
      });
    } else {
      this.customerService.create(this.customerForm).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.error = 'Failed to create customer';
          this.cdr.markForCheck();
        }
      });
    }
  }

  deleteCustomer(id: number) {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.delete(id).subscribe({
        next: () => {
          this.loadCustomers();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.error = 'Failed to delete customer';
          this.cdr.markForCheck();
        }
      });
    }
  }
}

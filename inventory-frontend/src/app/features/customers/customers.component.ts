import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-angular';
import { CustomerService, Customer, ApiResponse } from '../../core/services/customer.service';
import { AuthService } from '../../core/services/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { ExportExcelService } from '../../core/services/export-excel.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';
import { SweetAlertService } from '../../core/services/sweetalert.service';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe, HasPermissionDirective],
  templateUrl: './customers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersComponent implements OnInit, OnDestroy {
  customers: Customer[] = [];
  searchQuery = '';
  searchSubject = new Subject<string>();
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
    private authService: AuthService,
    private sweetAlert: SweetAlertService
  ) {
    this.user = this.authService.getCurrentUser();
  }

  user: any;

  ngOnInit() {
    this.loadCustomers();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.page = 1;
      this.loadCustomers();
    });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  loadCustomers() {
    this.isLoading = true;
    let isActive: boolean | undefined = undefined;
    if (this.selectedStatus === 'active') isActive = true;
    else if (this.selectedStatus === 'inactive') isActive = false;

    this.customerService.getAll(this.page, this.pageSize, this.searchQuery, isActive).subscribe({
      next: (res: any) => {
        this.customers = res?.data?.items || [];
        this.totalPages = Math.ceil((res?.data?.totalCount || 0) / this.pageSize) || 1;
        this.isLoading = false;
        this.error = '';
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.error = 'Failed to load customers';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
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

  exportToExcel() {
    let isActive: boolean | undefined = undefined;
    if (this.selectedStatus === 'active') isActive = true;
    else if (this.selectedStatus === 'inactive') isActive = false;

    this.customerService.getAll(1, 10000, this.searchQuery, isActive).subscribe({
      next: (res: any) => {
        const dataToExport = (res?.data?.items || []).map((c: any) => ({
          'ID': c.id,
          'Name': c.name,
          'Phone': c.phone || '—',
          'Email': c.email || '—',
          'Address': c.address || '—',
          'Status': c.isActive ? 'Active' : 'Inactive'
        }));
        this.exportExcel.export(dataToExport, 'Customers_Report');
      }
    });
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
    if (!this.customerForm.name?.trim()) {
      this.sweetAlert.error('Validation Error', 'Customer name is required.');
      return;
    }
    if (this.editingCustomer) {
      this.customerService.update(this.editingCustomer.id!, this.customerForm).subscribe({
        next: () => {
          this.error = '';
          this.sweetAlert.toast('Customer updated successfully');
          this.loadCustomers();
          this.closeModal();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Failed to update customer';
          this.sweetAlert.error('Error', this.error);
          this.cdr.markForCheck();
        }
      });
    } else {
      this.customerService.create(this.customerForm).subscribe({
        next: () => {
          this.error = '';
          this.sweetAlert.toast('Customer created successfully');
          this.loadCustomers();
          this.closeModal();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Failed to create customer';
          this.sweetAlert.error('Error', this.error);
          this.cdr.markForCheck();
        }
      });
    }
  }

  deleteCustomer(id: number) {
    this.sweetAlert.confirmDelete('this customer').then((result) => {
      if (result.isConfirmed) {
        this.customerService.delete(id).subscribe({
          next: () => {
            this.error = '';
            this.sweetAlert.success('Deleted', 'Customer has been deleted.');
            this.loadCustomers();
            this.cdr.markForCheck();
          },
          error: (err: any) => {
            this.error = err.error?.message || 'Failed to delete customer';
            this.sweetAlert.error('Error', this.error);
            this.cdr.markForCheck();
          }
        });
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-angular';
import { CustomerService, Customer, ApiResponse } from '../../core/services/customer.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ExportHelper } from '../../core/utils/export-helper';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './customers.component.html'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  pagedCustomers: Customer[] = [];
  searchQuery = '';
  selectedStatus = '';
  page = 1;
  pageSize = 10;
  totalPages = 1;
  isLoading = true;
  error = '';

  // Icons
  iconPlus = Plus;
  iconEdit = Edit2;
  iconTrash = Trash2;
  iconSearch = Search;
  iconChevronLeft = ChevronLeft;
  iconChevronRight = ChevronRight;

  // Modal State
  showModal = false;
  editingCustomer: Customer | null = null;
  customerForm: Partial<Customer> = {
    name: '',
    phone: '',
    email: '',
    address: '',
    isActive: true
  };

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.isLoading = true;
    this.customerService.getAll().subscribe({
      next: (res: ApiResponse<Customer[]>) => {
        this.customers = res.data;
        this.filterCustomers();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load customers';
        this.isLoading = false;
      }
    });
  }

  filterCustomers() {
    const q = this.searchQuery.trim().toLowerCase();

    this.filteredCustomers = this.customers.filter(c => {
      const matchesSearch = q ? (
        String(c.id).includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q))
      ) : true;

      let matchesStatus = true;
      if (this.selectedStatus === 'active') {
        matchesStatus = c.isActive === true;
      } else if (this.selectedStatus === 'inactive') {
        matchesStatus = c.isActive === false;
      }

      return matchesSearch && matchesStatus;
    });

    this.totalPages = Math.ceil(this.filteredCustomers.length / this.pageSize) || 1;
    if (this.page > this.totalPages) this.page = this.totalPages;
    if (this.page < 1) this.page = 1;

    this.pagedCustomers = this.filteredCustomers.slice(
      (this.page - 1) * this.pageSize,
      this.page * this.pageSize
    );
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.filterCustomers();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.filterCustomers();
    }
  }

  goToPage(pg: number) {
    this.page = pg;
    this.filterCustomers();
  }

  onPageSizeChange() {
    this.page = 1;
    this.filterCustomers();
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
    const dataToExport = this.filteredCustomers.map(c => ({
      'ID': c.id,
      'Name': c.name,
      'Phone': c.phone || '—',
      'Email': c.email || '—',
      'Address': c.address || '—',
      'Status': c.isActive ? 'Active' : 'Inactive'
    }));
    ExportHelper.toExcel(dataToExport, 'Customers_Report');
  }

  exportToPdf() {
    ExportHelper.toPdf('customers-table', 'Customers_Report');
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
        },
        error: (err: any) => this.error = 'Failed to update customer'
      });
    } else {
      this.customerService.create(this.customerForm).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
        },
        error: (err: any) => this.error = 'Failed to create customer'
      });
    }
  }

  deleteCustomer(id: number) {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.delete(id).subscribe({
        next: () => this.loadCustomers(),
        error: (err: any) => this.error = 'Failed to delete customer'
      });
    }
  }
}

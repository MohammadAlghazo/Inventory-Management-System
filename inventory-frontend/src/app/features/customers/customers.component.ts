import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Edit2, Trash2, Search } from 'lucide-angular';
import { CustomerService, Customer, ApiResponse } from '../../core/services/customer.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './customers.component.html'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  searchTerm = '';
  isLoading = true;
  error = '';

  // Icons
  iconPlus = Plus;
  iconEdit = Edit2;
  iconTrash = Trash2;
  iconSearch = Search;

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
    if (!this.searchTerm) {
      this.filteredCustomers = this.customers;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredCustomers = this.customers.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term)
      );
    }
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

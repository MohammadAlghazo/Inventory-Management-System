import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Edit2, Trash2, Search } from 'lucide-angular';
import { SupplierService, Supplier, ApiResponse } from '../../core/services/supplier.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './suppliers.component.html'
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
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
  editingSupplier: Supplier | null = null;
  supplierForm: Partial<Supplier> = {
    name: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    isActive: true
  };

  constructor(private supplierService: SupplierService) {}

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.isLoading = true;
    this.supplierService.getAll().subscribe({
      next: (res: ApiResponse<Supplier[]>) => {
        this.suppliers = res.data;
        this.filterSuppliers();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load suppliers';
        this.isLoading = false;
      }
    });
  }

  filterSuppliers() {
    if (!this.searchTerm) {
      this.filteredSuppliers = this.suppliers;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredSuppliers = this.suppliers.filter(s => 
        s.name.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.phone?.toLowerCase().includes(term)
      );
    }
  }

  openModal(supplier?: Supplier) {
    if (supplier) {
      this.editingSupplier = supplier;
      this.supplierForm = { ...supplier };
    } else {
      this.editingSupplier = null;
      this.supplierForm = { name: '', phone: '', email: '', address: '', taxNumber: '', isActive: true };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveSupplier() {
    if (this.editingSupplier) {
      this.supplierService.update(this.editingSupplier.id!, this.supplierForm).subscribe({
        next: () => {
          this.loadSuppliers();
          this.closeModal();
        },
        error: (err: any) => this.error = 'Failed to update supplier'
      });
    } else {
      this.supplierService.create(this.supplierForm).subscribe({
        next: () => {
          this.loadSuppliers();
          this.closeModal();
        },
        error: (err: any) => this.error = 'Failed to create supplier'
      });
    }
  }

  deleteSupplier(id: number) {
    if (confirm('Are you sure you want to delete this supplier?')) {
      this.supplierService.delete(id).subscribe({
        next: () => this.loadSuppliers(),
        error: (err: any) => this.error = 'Failed to delete supplier'
      });
    }
  }
}

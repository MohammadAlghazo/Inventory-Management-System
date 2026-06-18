import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-angular';
import { SupplierService, Supplier, ApiResponse } from '../../core/services/supplier.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ExportExcelService } from '../../core/services/export-excel.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './suppliers.component.html'
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  pagedSuppliers: Supplier[] = [];
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
  editingSupplier: Supplier | null = null;
  supplierForm: Partial<Supplier> = {
    name: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    isActive: true
  };

  constructor(
    private supplierService: SupplierService,
    private exportExcel: ExportExcelService,
    private exportPdf: ExportPdfService
  ) {}

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
    const q = this.searchQuery.trim().toLowerCase();

    this.filteredSuppliers = this.suppliers.filter(s => {
      const matchesSearch = q ? (
        String(s.id).includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.phone && s.phone.toLowerCase().includes(q)) ||
        (s.taxNumber && s.taxNumber.toLowerCase().includes(q))
      ) : true;

      let matchesStatus = true;
      if (this.selectedStatus === 'active') {
        matchesStatus = s.isActive === true;
      } else if (this.selectedStatus === 'inactive') {
        matchesStatus = s.isActive === false;
      }

      return matchesSearch && matchesStatus;
    });

    this.totalPages = Math.ceil(this.filteredSuppliers.length / this.pageSize) || 1;
    if (this.page > this.totalPages) this.page = this.totalPages;
    if (this.page < 1) this.page = 1;
    
    this.pagedSuppliers = this.filteredSuppliers.slice(
      (this.page - 1) * this.pageSize,
      this.page * this.pageSize
    );
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.filterSuppliers();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.filterSuppliers();
    }
  }

  goToPage(pg: number) {
    this.page = pg;
    this.filterSuppliers();
  }

  onPageSizeChange() {
    this.page = 1;
    this.filterSuppliers();
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
    const dataToExport = this.filteredSuppliers.map(s => ({
      'ID': s.id,
      'Name': s.name,
      'Phone': s.phone || '—',
      'Email': s.email || '—',
      'Address': s.address || '—',
      'Tax Number': s.taxNumber || '—',
      'Status': s.isActive ? 'Active' : 'Inactive'
    }));
    this.exportExcel.export(dataToExport, 'Suppliers_Report');
  }

  exportToPdf() {
    this.exportPdf.export('suppliers-table', 'Suppliers_Report');
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

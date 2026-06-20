import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-angular';
import { SupplierService, Supplier, ApiResponse } from '../../core/services/supplier.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ExportExcelService } from '../../core/services/export-excel.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './suppliers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
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
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.isLoading = true;
    this.supplierService.getAll(this.page, this.pageSize, this.searchQuery).subscribe({
      next: (res: any) => {
        let items = res?.data?.items || [];
        
        if (this.selectedStatus === 'active') {
          items = items.filter((s: any) => s.isActive === true);
        } else if (this.selectedStatus === 'inactive') {
          items = items.filter((s: any) => s.isActive === false);
        }
        
        this.suppliers = items;
        this.totalPages = Math.ceil((res?.data?.totalCount || 0) / this.pageSize) || 1;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.error = 'Failed to load suppliers';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  filterSuppliers() {
    this.page = 1;
    this.loadSuppliers();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadSuppliers();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadSuppliers();
    }
  }

  goToPage(pg: number) {
    this.page = pg;
    this.loadSuppliers();
  }

  onPageSizeChange() {
    this.page = 1;
    this.loadSuppliers();
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
    const dataToExport = this.suppliers.map(s => ({
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
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.error = 'Failed to update supplier';
          this.cdr.markForCheck();
        }
      });
    } else {
      this.supplierService.create(this.supplierForm).subscribe({
        next: () => {
          this.loadSuppliers();
          this.closeModal();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.error = 'Failed to create supplier';
          this.cdr.markForCheck();
        }
      });
    }
  }

  deleteSupplier(id: number) {
    if (confirm('Are you sure you want to delete this supplier?')) {
      this.supplierService.delete(id).subscribe({
        next: () => {
          this.loadSuppliers();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.error = 'Failed to delete supplier';
          this.cdr.markForCheck();
        }
      });
    }
  }
}

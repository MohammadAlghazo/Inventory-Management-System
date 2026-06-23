import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-angular';
import { SupplierService, Supplier, ApiResponse } from '../../core/services/supplier.service';
import { AuthService } from '../../core/services/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { ExportExcelService } from '../../core/services/export-excel.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';
import { SweetAlertService } from '../../core/services/sweetalert.service';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe, HasPermissionDirective],
  templateUrl: './suppliers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
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
    private authService: AuthService,
    private sweetAlert: SweetAlertService
  ) {
    this.user = this.authService.getCurrentUser();
  }

  user: any;

  ngOnInit() {
    this.loadSuppliers();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.page = 1;
      this.loadSuppliers();
    });
  }

  loadSuppliers() {
    this.isLoading = true;
    let isActive: boolean | undefined = undefined;
    if (this.selectedStatus === 'active') isActive = true;
    else if (this.selectedStatus === 'inactive') isActive = false;

    this.supplierService.getAll(this.page, this.pageSize, this.searchQuery, isActive).subscribe({
      next: (res: any) => {
        this.suppliers = res?.data?.items || [];
        this.totalPages = Math.ceil((res?.data?.totalCount || 0) / this.pageSize) || 1;
        this.isLoading = false;
        this.error = '';
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.error = 'Failed to load suppliers';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
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

    this.supplierService.getAll(1, 10000, this.searchQuery, isActive).subscribe({
      next: (res: any) => {
        const dataToExport = (res?.data?.items || []).map((s: any) => ({
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
    });
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
          this.error = '';
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
          this.error = '';
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
    this.sweetAlert.confirmDelete('this supplier').then((result) => {
      if (result.isConfirmed) {
        this.supplierService.delete(id).subscribe({
          next: () => {
            this.error = '';
            this.sweetAlert.success('Deleted', 'Supplier has been deleted.');
            this.loadSuppliers();
            this.cdr.markForCheck();
          },
          error: (err: any) => {
            this.error = 'Failed to delete supplier';
            this.cdr.markForCheck();
          }
        });
      }
    });
  }
}

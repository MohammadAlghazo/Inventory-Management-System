import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, Category, Brand, Unit, Warehouse } from '../../core/services/settings.service';
import { SweetAlertService } from '../../core/services/sweetalert.service';
import { LucideAngularModule, Edit2, Trash2 } from 'lucide-angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  activeTab: 'categories' | 'brands' | 'units' | 'warehouses' = 'categories';
  categories: Category[] = [];
  brands: Brand[] = [];
  units: Unit[] = [];
  warehouses: Warehouse[] = [];
  showModal = false;
  modalType: 'category' | 'brand' | 'unit' | 'warehouse' = 'category';
  isEditing = false;
  isSaving = false;
  formData: any = {};
  icons = { Edit2, Trash2 };

  constructor(
    private settingsService: SettingsService,
    private sweetAlert: SweetAlertService,
    private translate: TranslateService
  ) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.settingsService.getCategories().subscribe({
      next: (res: any) => this.categories = res.data || [],
      error: () => {}
    });
    this.settingsService.getBrands().subscribe({
      next: (res: any) => this.brands = res.data || [],
      error: () => {}
    });
    this.settingsService.getUnits().subscribe({
      next: (res: any) => this.units = res.data || [],
      error: () => {}
    });
    this.settingsService.getWarehouses().subscribe({
      next: (res: any) => this.warehouses = res.data || [],
      error: () => {}
    });
  }

  setTab(tab: 'categories' | 'brands' | 'units' | 'warehouses') { this.activeTab = tab; }

  openModal(type: 'category' | 'brand' | 'unit' | 'warehouse') {
    this.modalType = type;
    this.isEditing = false;
    this.isSaving = false;
    this.formData = type === 'warehouse' ? { isActive: true } : {};
    this.showModal = true;
  }

  editItem(item: any, type: 'category' | 'brand' | 'unit' | 'warehouse') {
    this.modalType = type;
    this.isEditing = true;
    this.isSaving = false;
    this.formData = { ...item };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isSaving = false;
  }

  getModalTypeKey() {
    return `SETTINGS.TYPE_${this.modalType.toUpperCase()}`;
  }

  save() {
    if (!this.formData.name?.trim()) {
      this.sweetAlert.error(this.translate.instant('COMMON.VALIDATION_ERROR'), this.translate.instant('SETTINGS.NAME_REQUIRED'));
      return;
    }
    if (this.modalType === 'unit' && !this.formData.abbreviation?.trim()) {
      this.sweetAlert.error(this.translate.instant('COMMON.VALIDATION_ERROR'), this.translate.instant('SETTINGS.ABBREVIATION_REQUIRED'));
      return;
    }
    if (this.isSaving) return;
    this.isSaving = true;
    const req = this.isEditing ? this.getUpdateRequest() : this.getCreateRequest();
    req.subscribe({
      next: () => {
        this.isSaving = false;
        this.sweetAlert.success(
          this.translate.instant('COMMON.SUCCESS'),
          this.translate.instant('SETTINGS.SAVE_SUCCESS', { type: this.translate.instant(this.getModalTypeKey()) })
        );
        this.loadData();
        this.closeModal();
      },
      error: () => { this.isSaving = false; }
    });
  }

  getCreateRequest() {
    if (this.modalType === 'category') return this.settingsService.createCategory(this.formData);
    if (this.modalType === 'brand') return this.settingsService.createBrand(this.formData);
    if (this.modalType === 'unit') return this.settingsService.createUnit(this.formData);
    return this.settingsService.createWarehouse(this.formData);
  }

  getUpdateRequest() {
    if (this.modalType === 'category') return this.settingsService.updateCategory(this.formData.id, this.formData);
    if (this.modalType === 'brand') return this.settingsService.updateBrand(this.formData.id, this.formData);
    if (this.modalType === 'unit') return this.settingsService.updateUnit(this.formData.id, this.formData);
    return this.settingsService.updateWarehouse(this.formData.id, this.formData);
  }

  deleteItem(id: number, type: 'category' | 'brand' | 'unit' | 'warehouse') {
    this.sweetAlert.confirmDelete(type).then((result) => {
      if (result.isConfirmed) {
        let req;
        if (type === 'category') req = this.settingsService.deleteCategory(id);
        else if (type === 'brand') req = this.settingsService.deleteBrand(id);
        else if (type === 'unit') req = this.settingsService.deleteUnit(id);
        else req = this.settingsService.deleteWarehouse(id);
        req.subscribe({
          next: () => {
            this.sweetAlert.success(
              this.translate.instant('COMMON.DELETED'),
              this.translate.instant('SETTINGS.DELETE_SUCCESS', { type: this.translate.instant(`SETTINGS.TYPE_${type.toUpperCase()}`) })
            );
            this.loadData();
          },
          error: () => {}
        });
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, Category, Brand, Unit, Warehouse } from '../../core/services/settings.service';
import { SweetAlertService } from '../../core/services/sweetalert.service';
import { LucideAngularModule, Edit2, Trash2 } from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';

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
  
  formData: any = {};
  
  icons = { Edit2, Trash2 };

  constructor(
    private settingsService: SettingsService,
    private sweetAlert: SweetAlertService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.settingsService.getCategories().subscribe((res: any) => this.categories = res.data);
    this.settingsService.getBrands().subscribe((res: any) => this.brands = res.data);
    this.settingsService.getUnits().subscribe((res: any) => this.units = res.data);
    this.settingsService.getWarehouses().subscribe((res: any) => this.warehouses = res.data);
  }

  setTab(tab: 'categories' | 'brands' | 'units' | 'warehouses') {
    this.activeTab = tab;
  }

  openModal(type: 'category' | 'brand' | 'unit' | 'warehouse') {
    this.modalType = type;
    this.isEditing = false;
    this.formData = type === 'warehouse' ? { isActive: true } : {};
    this.showModal = true;
  }

  editItem(item: any, type: 'category' | 'brand' | 'unit' | 'warehouse') {
    this.modalType = type;
    this.isEditing = true;
    this.formData = { ...item };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    const isUpdate = this.isEditing;
    const req = isUpdate ? this.getUpdateRequest() : this.getCreateRequest();

    req.subscribe({
      next: () => {
        this.sweetAlert.success('Success', `${this.modalType} saved successfully.`);
        this.loadData();
        this.closeModal();
      },
      error: () => {
        // Error handled by interceptor
      }
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
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      let req;
      if (type === 'category') req = this.settingsService.deleteCategory(id);
      else if (type === 'brand') req = this.settingsService.deleteBrand(id);
      else if (type === 'unit') req = this.settingsService.deleteUnit(id);
      else req = this.settingsService.deleteWarehouse(id);

      req.subscribe({
        next: () => {
          this.sweetAlert.success('Deleted', `${type} has been deleted.`);
          this.loadData();
        },
        error: () => {}
      });
    }
  }
}

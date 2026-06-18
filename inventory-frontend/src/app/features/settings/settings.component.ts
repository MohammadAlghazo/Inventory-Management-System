import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, Category, Brand, Unit, Warehouse } from '../../core/services/settings.service';
import { LucideAngularModule } from 'lucide-angular';
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
  
  formData: any = {};

  constructor(private settingsService: SettingsService) {}

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
    this.formData = type === 'warehouse' ? { isActive: true } : {};
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    if (this.modalType === 'category') {
      this.settingsService.createCategory(this.formData).subscribe(() => {
        this.loadData();
        this.closeModal();
      });
    } else if (this.modalType === 'brand') {
      this.settingsService.createBrand(this.formData).subscribe(() => {
        this.loadData();
        this.closeModal();
      });
    } else if (this.modalType === 'unit') {
      this.settingsService.createUnit(this.formData).subscribe(() => {
        this.loadData();
        this.closeModal();
      });
    } else if (this.modalType === 'warehouse') {
      this.settingsService.createWarehouse(this.formData).subscribe(() => {
        this.loadData();
        this.closeModal();
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Archive, ArrowUpCircle, ArrowDownCircle, Search } from 'lucide-angular';
import { InventoryService } from '../../core/services/inventory.service';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {
  inventoryLogs: any[] = [];
  isLoading = false;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit() {
    this.loadInventoryLogs();
  }

  loadInventoryLogs() {
    this.isLoading = true;
    this.inventoryService.getInventoryLogs().subscribe({
      next: (data: any[]) => {
        this.inventoryLogs = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}

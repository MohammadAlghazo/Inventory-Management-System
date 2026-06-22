import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard, 
  Package, 
  Settings, 
  Users, 
  LogOut,
  Boxes,
  User,
  Truck,
  Users2,
  ShoppingCart,
  FileText,
  ChevronLeft, 
  ChevronRight,
  X,
  AlertTriangle,
  BarChart3,
  Bot
} from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  readonly icons = { LogOut, Boxes, ChevronLeft, ChevronRight, X, AlertTriangle, BarChart3 };
  user: any = null;

  private isResizing = false;
  private startX = 0;
  private startWidth = 0;

  menuItems: any[] = [
    { label: 'SIDEBAR.DASHBOARD', route: '/dashboard', icon: LayoutDashboard, color: '#3b82f6' }, // blue
    { label: 'SIDEBAR.PRODUCTS',  route: '/products',  icon: Package, color: '#f59e0b' }, // amber
    { label: 'SIDEBAR.INVENTORY', route: '/inventory', icon: Boxes, color: '#10b981' }, // emerald
    { label: 'SIDEBAR.PURCHASE_ORDERS', route: '/purchase-orders', icon: FileText, color: '#8b5cf6' }, // purple
    { label: 'SIDEBAR.SALES_ORDERS', route: '/sales-orders', icon: ShoppingCart, color: '#ec4899' }, // pink
    { label: 'SIDEBAR.LOW_STOCK', route: '/low-stock', icon: AlertTriangle, color: '#ef4444' }, // red
    { label: 'SIDEBAR.REPORTS', route: '/reports', icon: BarChart3, color: '#0ea5e9' }, // sky blue
    { label: 'SIDEBAR.SUPPLIERS', route: '/suppliers',  icon: Truck, color: '#14b8a6' }, // teal
    { label: 'SIDEBAR.CUSTOMERS', route: '/customers',  icon: Users2, color: '#f97316' }, // orange
    { label: 'SIDEBAR.USERS',     route: '/users',      icon: Users, color: '#6366f1' }, // indigo
    { label: 'SIDEBAR.PROFILE',   route: '/profile',    icon: User, color: '#a855f7' }, // violet
    { label: 'SIDEBAR.SETTINGS',  route: '/settings',   icon: Settings, color: '#64748b' }, // slate
    { label: 'AI Assistant', route: '/ai-assistant', icon: Bot, color: '#ec4899' } // pink
  ];

  get filteredMenuItems() {
    const role = this.userRole;
    if (role === 'SuperAdmin' || role === 'Manager') return this.menuItems;
    
    let allowedRoutes: string[] = ['/dashboard', '/products', '/inventory', '/profile', '/ai-assistant'];

    if (role === 'InventoryManager') {
      allowedRoutes.push('/suppliers', '/customers', '/purchase-orders', '/sales-orders', '/low-stock', '/reports');
    } else if (role === 'PurchasingOfficer') {
      allowedRoutes.push('/suppliers', '/purchase-orders', '/low-stock');
    } else if (role === 'Sales') {
      allowedRoutes.push('/customers', '/sales-orders');
    } else if (role === 'WarehouseStaff' || role === 'Employee') {
      allowedRoutes.push('/low-stock');
    } else if (role === 'Accountant' || role === 'Auditor') {
      allowedRoutes.push('/reports');
    }

    return this.menuItems.filter(item => allowedRoutes.includes(item.route));
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    public layoutService: LayoutService,
    private elRef: ElementRef
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
  }

  ngOnDestroy() {}

  get userName() {
    return this.user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User';
  }

  get userRole() {
    return this.user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Employee';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onResizeStart(event: MouseEvent) {
    this.isResizing = true;
    this.startX = event.clientX;
    this.startWidth = this.layoutService.sidebarWidth;
    document.body.classList.add('is-resizing');
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;
    const dir = document.documentElement.dir === 'rtl' ? -1 : 1;
    const delta = (event.clientX - this.startX) * dir;
    this.layoutService.setSidebarWidth(this.startWidth + delta);
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.isResizing) {
      this.isResizing = false;
      document.body.classList.remove('is-resizing');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
  }
}

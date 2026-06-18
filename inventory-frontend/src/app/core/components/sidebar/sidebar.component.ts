import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { LucideAngularModule, LogOut, Boxes, ChevronLeft, ChevronRight, LayoutDashboard, Package, Truck, Users, Archive, Settings } from 'lucide-angular';
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
export class SidebarComponent implements OnInit {
  readonly icons = { LogOut, Boxes, ChevronLeft, ChevronRight };
  user: any = null;

  menuItems = [
    { label: 'SIDEBAR.DASHBOARD', route: '/dashboard', icon: LayoutDashboard },
    { label: 'SIDEBAR.PRODUCTS', route: '/products', icon: Package },
    { label: 'SIDEBAR.SUPPLIERS', route: '/suppliers', icon: Truck },
    { label: 'SIDEBAR.CUSTOMERS', route: '/customers', icon: Users },
    { label: 'SIDEBAR.INVENTORY', route: '/inventory', icon: Archive },
    { label: 'SIDEBAR.USERS', route: '/users', icon: Users },
    { label: 'SIDEBAR.SETTINGS', route: '/settings', icon: Settings },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    public layoutService: LayoutService
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
  }

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
}

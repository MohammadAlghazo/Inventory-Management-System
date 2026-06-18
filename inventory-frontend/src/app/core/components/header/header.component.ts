import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LucideAngularModule, Menu, Globe, Moon, Sun, Bell, Check, Trash } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, LucideAngularModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  readonly icons = { Menu, Globe, Moon, Sun, Bell, Check, Trash };
  user: any = null;
  currentLang: string = 'en';
  isDarkMode = true;
  notificationsList: Notification[] = [];
  showNotifications = false;
  pageTitle: string = 'SIDEBAR.DASHBOARD';

  constructor(
    private authService: AuthService,
    private translate: TranslateService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    const lang = this.translate.currentLang;
    this.currentLang = typeof lang === 'string' ? lang : 'en';
  }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });

    // Initialize Theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    this.isDarkMode = savedTheme === 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    this.loadNotifications();

    // Monitor route changes for title
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateTitle();
    });
    this.updateTitle();
  }

  updateTitle() {
    const url = this.router.url;
    if (url.includes('/products')) {
      this.pageTitle = 'SIDEBAR.PRODUCTS';
    } else if (url.includes('/suppliers')) {
      this.pageTitle = 'SIDEBAR.SUPPLIERS';
    } else if (url.includes('/customers')) {
      this.pageTitle = 'SIDEBAR.CUSTOMERS';
    } else if (url.includes('/inventory')) {
      this.pageTitle = 'SIDEBAR.INVENTORY';
    } else if (url.includes('/users')) {
      this.pageTitle = 'SIDEBAR.USERS';
    } else if (url.includes('/settings')) {
      this.pageTitle = 'SIDEBAR.SETTINGS';
    } else {
      this.pageTitle = 'SIDEBAR.DASHBOARD';
    }
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (res) => {
        this.notificationsList = res.data || [];
      },
      error: () => {}
    });
  }

  get unreadNotificationsCount() {
    return this.notificationsList.filter(n => !n.isRead).length;
  }

  markAsRead(id: number, event: Event) {
    event.stopPropagation();
    this.notificationService.markAsRead(id).subscribe({
      next: () => this.loadNotifications()
    });
  }

  markAllRead() {
    this.notificationService.markAllRead().subscribe({
      next: () => this.loadNotifications()
    });
  }

  deleteNotification(id: number, event: Event) {
    event.stopPropagation();
    this.notificationService.delete(id).subscribe({
      next: () => this.loadNotifications()
    });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    const theme = this.isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  switchLang() {
    const newLang = this.currentLang === 'en' ? 'ar' : 'en';
    this.translate.use(newLang);
    localStorage.setItem('lang', newLang);
    // Explicitly update dir immediately
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  }

  get userName() { 
    return this.user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User'; 
  }

  get userRole() { 
    return this.user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Employee'; 
  }
}

import { Component, OnInit, HostListener, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LucideAngularModule, Menu, Globe, Moon, Sun, Bell, Check, Trash, Palette } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { NotificationService, Notification } from '../../services/notification.service';
import { LayoutService } from '../../services/layout.service';
import { ThemeService, ColorScheme } from '../../services/theme.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProfileService } from '../../services/profile.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule, LucideAngularModule, TranslatePipe, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  readonly icons = { Menu, Globe, Moon, Sun, Bell, Check, Trash, Palette };
  user: any = null;
  dbProfile: any = null;
  profileSub?: Subscription;
  currentLang: string = 'en';
  destroyRef: DestroyRef;
  isDarkMode = true;
  showThemes = false;
  currentScheme = 'sunset';
  availableSchemes: ColorScheme[] = [];
  notificationsList: Notification[] = [];
  showNotifications = false;
  pageTitle: string = 'SIDEBAR.DASHBOARD';

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private translate: TranslateService,
    private notificationService: NotificationService,
    private router: Router,
    public layoutService: LayoutService,
    public themeService: ThemeService
  ) {
    this.destroyRef = inject(DestroyRef);
    const lang = this.translate.currentLang || localStorage.getItem('lang') || 'en';
    this.currentLang = typeof lang === 'string' ? lang : 'en';

    this.translate.onLangChange.pipe(takeUntilDestroyed()).subscribe(event => {
      this.currentLang = event.lang;
    });
  }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.profileSub = this.profileService.currentProfile$.subscribe(profile => {
      this.dbProfile = profile;
    });

    this.availableSchemes = this.themeService.availableSchemes;
    this.themeService.isDarkMode$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(isDark => this.isDarkMode = isDark);
    this.themeService.currentScheme$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(scheme => this.currentScheme = scheme);

    this.loadNotifications();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.updateTitle();
      this.showNotifications = false; 
    });
    this.updateTitle();
  }

  ngOnDestroy() {
    if (this.profileSub) {
      this.profileSub.unsubscribe();
    }
  }

  updateTitle() {
    const url = this.router.url;
    if (url.includes('/products'))  this.pageTitle = 'SIDEBAR.PRODUCTS';
    else if (url.includes('/suppliers'))  this.pageTitle = 'SIDEBAR.SUPPLIERS';
    else if (url.includes('/customers'))  this.pageTitle = 'SIDEBAR.CUSTOMERS';
    else if (url.includes('/inventory'))  this.pageTitle = 'SIDEBAR.INVENTORY';
    else if (url.includes('/users'))      this.pageTitle = 'SIDEBAR.USERS';
    else if (url.includes('/settings'))   this.pageTitle = 'SIDEBAR.SETTINGS';
    else if (url.includes('/profile'))    this.pageTitle = 'SIDEBAR.PROFILE';
    else                                  this.pageTitle = 'SIDEBAR.DASHBOARD';
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (res) => { this.notificationsList = res.data || []; },
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

  navigateFromNotification(item: Notification) {
    this.showNotifications = false;
    
    if (!item.isRead) {
      this.notificationService.markAsRead(item.id).subscribe({ next: () => this.loadNotifications() });
    }
    const title = item.title.toLowerCase();
    const msg = item.message.toLowerCase();
    const full = (title + ' ' + msg);

    if (full.includes('supplier')) {
      this.router.navigate(['/suppliers']);
    } else if (full.includes('customer')) {
      this.router.navigate(['/customers']);
    } else if (full.includes('user') || full.includes('role') || full.includes('account') || full.includes('profile')) {
      this.router.navigate(['/users']);
    } else if (full.includes('inventory') || full.includes('movement') || full.includes('stock adjustment') || full.includes('log') || full.includes('transferred') || full.includes('updated stock')) {
      this.router.navigate(['/inventory']);
    } else if (full.includes('product') || full.includes('stock') || full.includes('reorder') || full.includes('low stock')) {
      this.router.navigate(['/products']);
    } else if (full.includes('setting') || full.includes('category') || full.includes('brand') || full.includes('unit')) {
      this.router.navigate(['/settings']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleTheme() { this.themeService.toggleDarkMode(); }

  toggleThemesMenu() { this.showThemes = !this.showThemes; this.showNotifications = false; }

  selectTheme(schemeId: string) { this.themeService.setColorScheme(schemeId); this.showThemes = false; }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.showNotifications && !target.closest('.notif-dropdown') && !target.closest('.header-notif-btn')) {
      this.showNotifications = false;
    }
    if (this.showThemes && !target.closest('.themes-dropdown') && !target.closest('.theme-btn')) {
      this.showThemes = false;
    }
  }

  switchLang() {
    const newLang = this.currentLang === 'en' ? 'ar' : 'en';
    this.translate.use(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.dir  = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  }

  get userName() {
    return this.user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User';
  }

  get userRole() {
    return this.user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Employee';
  }
}

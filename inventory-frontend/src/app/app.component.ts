import { Component, ApplicationRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { SweetAlertService } from './core/services/sweetalert.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'StockMaster';

  constructor(
    private translate: TranslateService,
    private swUpdate: SwUpdate,
    private sweetAlert: SweetAlertService
  ) {
    this.translate.onLangChange.pipe(takeUntilDestroyed()).subscribe(event => {
      document.documentElement.dir = event.lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = event.lang;
    });

    const savedLang = localStorage.getItem('lang') || 'en';
    const langToUse = savedLang.match(/en|ar/) ? savedLang : 'en';
    this.translate.use(langToUse);
    
    document.documentElement.dir = langToUse === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = langToUse;

    // Listen for PWA Updates
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      ).subscribe(() => {
        const isAr = this.translate.currentLang === 'ar' || document.documentElement.lang === 'ar';
        this.sweetAlert.confirm(
          isAr ? 'تحديث جديد متاح! 🚀' : 'New Update Available! 🚀',
          isAr ? 'تم تحديث الموقع بخصائص جديدة، الرجاء إعادة تحميل الصفحة لتطبيق التحديث.' : 'A new version of StockMaster is available. Reload now to update?',
          isAr ? 'تحديث الآن' : 'Update Now'
        ).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      });
    }
  }
}

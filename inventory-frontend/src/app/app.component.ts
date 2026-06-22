import { Component, ApplicationRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { SweetAlertService } from './core/services/sweetalert.service';
import { filter } from 'rxjs/operators';
import { AiAssistantComponent } from './features/ai-assistant/ai-assistant.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AiAssistantComponent],
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
        this.sweetAlert.confirm(
          'New Update Available',
          'A new version of StockMaster is available. Reload now to update?',
          'Update Now'
        ).then((result: any) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      });
    }
  }
}

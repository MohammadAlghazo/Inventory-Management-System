import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'StockMaster';

  constructor(private translate: TranslateService) {
    this.translate.onLangChange.subscribe(event => {
      document.documentElement.dir = event.lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = event.lang;
    });

    const savedLang = localStorage.getItem('lang') || 'en';
    const langToUse = savedLang.match(/en|ar/) ? savedLang : 'en';
    this.translate.use(langToUse);
    // Explicitly set the dir on first load to prevent flash/blank RTL
    document.documentElement.dir = langToUse === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = langToUse;
  }
}

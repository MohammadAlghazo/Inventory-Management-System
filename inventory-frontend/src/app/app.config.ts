import { ApplicationConfig, provideZoneChangeDetection, isDevMode, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { provideServiceWorker } from '@angular/service-worker';

export class TranslateCacheBusterLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}
  getTranslation(lang: string): Observable<any> {
    return this.http.get(`/assets/i18n/${lang}.json?cb=${new Date().getTime()}`, {
      headers: { 'X-Skip-Error-Alert': 'true' }
    });
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideCharts(withDefaultRegisterables()),
    provideTranslateService({
      fallbackLang: 'en',
      lang: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new TranslateCacheBusterLoader(http),
        deps: [HttpClient]
      }
    }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
          }),
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'JOD' }
  ]
};

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SupplierService } from './supplier.service';

/**
 * Singleton service that caches reference/lookup data for the lifetime of the app session.
 * Uses shareReplay(1) so multiple components can subscribe without triggering extra HTTP calls.
 * Call invalidate() after any CRUD operation to clear a specific cache entry.
 */
@Injectable({
  providedIn: 'root'
})
export class LookupStateService {
  private readonly apiUrl = environment.apiUrl;

  private _categories$: Observable<any> | null = null;
  private _units$: Observable<any> | null = null;
  private _suppliers$: Observable<any> | null = null;
  private _warehouses$: Observable<any> | null = null;

  constructor(
    private http: HttpClient,
    private supplierService: SupplierService
  ) {}

  get categories$(): Observable<any> {
    if (!this._categories$) {
      this._categories$ = this.http
        .get<any>(`${this.apiUrl}/lookup/categories`)
        .pipe(shareReplay(1));
    }
    return this._categories$;
  }

  get units$(): Observable<any> {
    if (!this._units$) {
      this._units$ = this.http
        .get<any>(`${this.apiUrl}/lookup/units`)
        .pipe(shareReplay(1));
    }
    return this._units$;
  }

  get suppliers$(): Observable<any> {
    if (!this._suppliers$) {
      this._suppliers$ = this.supplierService
        .getAll(1, 500)
        .pipe(shareReplay(1));
    }
    return this._suppliers$;
  }

  get warehouses$(): Observable<any> {
    if (!this._warehouses$) {
      this._warehouses$ = this.http
        .get<any>(`${this.apiUrl}/lookup/warehouses`)
        .pipe(shareReplay(1));
    }
    return this._warehouses$;
  }

  /**
   * Invalidate specific cache entries after CRUD operations.
   * Call invalidate('categories') after creating/editing a category, etc.
   */
  invalidate(key: 'categories' | 'units' | 'suppliers' | 'warehouses' | 'all'): void {
    if (key === 'categories' || key === 'all') this._categories$ = null;
    if (key === 'units'      || key === 'all') this._units$ = null;
    if (key === 'suppliers'  || key === 'all') this._suppliers$ = null;
    if (key === 'warehouses' || key === 'all') this._warehouses$ = null;
  }
}

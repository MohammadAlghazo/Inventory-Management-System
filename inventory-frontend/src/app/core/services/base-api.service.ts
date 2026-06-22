import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export abstract class BaseApiService<T> {
  protected apiUrl: string;

  protected constructor(protected http: HttpClient, endpoint: string) {
    this.apiUrl = `${environment.apiUrl}/${endpoint}`;
  }

  getAll(queryParams?: any): Observable<any> {
    let params = new HttpParams();
    if (queryParams) {
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] !== null && queryParams[key] !== undefined) {
          params = params.append(key, queryParams[key]);
        }
      });
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: number | string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

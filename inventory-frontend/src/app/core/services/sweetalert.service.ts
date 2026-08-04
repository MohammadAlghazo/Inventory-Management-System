import { Injectable, Injector } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {
  
  constructor(private injector: Injector) { }

  private get translate(): TranslateService {
    // Resolve translations only when an alert is shown to avoid a loader/interceptor cycle.
    return this.injector.get(TranslateService);
  }

  success(title: string, text: string = '') {
    return Swal.fire({
      title,
      html: text,
      icon: 'success',
      confirmButtonColor: '#4338ca', 
      customClass: {
        confirmButton: 'btn btn-primary px-4 py-2 rounded-3'
      },
      buttonsStyling: false
    });
  }

  error(title: string, text: string = '') {
    return Swal.fire({
      title,
      html: text,
      icon: 'error',
      confirmButtonColor: '#ef4444',
      customClass: {
        confirmButton: 'btn btn-danger px-4 py-2 rounded-3'
      },
      buttonsStyling: false
    });
  }

  warning(title: string, text: string = '') {
    return Swal.fire({
      title,
      html: text,
      icon: 'warning',
      confirmButtonColor: '#f59e0b',
      customClass: {
        confirmButton: 'btn btn-warning px-4 py-2 rounded-3 text-white'
      },
      buttonsStyling: false
    });
  }

  confirmDelete(itemName: string): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title: this.translate.instant('COMMON.ARE_YOU_SURE'),
      html: this.translate.instant('COMMON.DELETE_CONFIRMATION', { item: itemName }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6c757d',
      confirmButtonText: this.translate.instant('COMMON.YES_DELETE'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
      customClass: {
        confirmButton: 'btn btn-danger me-3 px-4 py-2 rounded-3',
        cancelButton: 'btn btn-secondary px-4 py-2 rounded-3'
      },
      buttonsStyling: false
    });
  }

  confirm(title: string, text: string, confirmButtonText?: string): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title,
      html: text,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#4338ca',
      cancelButtonColor: '#6c757d',
      confirmButtonText: confirmButtonText || this.translate.instant('COMMON.CONFIRM'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
      customClass: {
        confirmButton: 'btn btn-primary me-3 px-4 py-2 rounded-3',
        cancelButton: 'btn btn-secondary px-4 py-2 rounded-3'
      },
      buttonsStyling: false
    });
  }

  toast(title: string, icon: SweetAlertIcon = 'success') {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });

    return Toast.fire({
      icon,
      title
    });
  }
}

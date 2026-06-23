import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {
  
  constructor() { }

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
      title: 'Are you sure?',
      html: `You are about to delete ${itemName}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        confirmButton: 'btn btn-danger me-3 px-4 py-2 rounded-3',
        cancelButton: 'btn btn-secondary px-4 py-2 rounded-3'
      },
      buttonsStyling: false
    });
  }

  confirm(title: string, text: string, confirmButtonText: string = 'Confirm'): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title,
      html: text,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#4338ca',
      cancelButtonColor: '#6c757d',
      confirmButtonText,
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

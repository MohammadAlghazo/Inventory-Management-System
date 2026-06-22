import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { SweetAlertService } from '../services/sweetalert.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const swalService = inject(SweetAlertService);
  const skipAlert = req.headers.has('X-Skip-Error-Alert');

  // Strip the header so it doesn't get sent to the backend
  let targetReq = req;
  if (skipAlert) {
    targetReq = req.clone({
      headers: req.headers.delete('X-Skip-Error-Alert')
    });
  }

  return next(targetReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't intercept 401 Unauthorized here, auth.interceptor handles it
      if (error.status === 401) {
        return throwError(() => error);
      }

      let errorMessage = 'An unexpected error occurred.';
      let errorTitle = 'Error';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `A network error occurred. Please check your connection.`;
      } else {
        // Backend error
        if (error.status === 0) {
          errorMessage = 'Cannot connect to the server. Please verify your internet connection or try again later.';
          errorTitle = 'Connection Failed';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
          errorTitle = 'Access Denied';
        } else if (error.status === 404) {
          errorMessage = 'The requested resource was not found.';
          errorTitle = 'Not Found';
        } else if (error.status === 400) {
          errorTitle = 'Invalid Request';
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error && error.error.errors) {
            // Validation errors
            const validationErrors = Object.values(error.error.errors).flat();
            errorMessage = validationErrors.join('<br>');
          } else {
            errorMessage = 'Please check the submitted data and try again.';
          }
        } else if (error.status >= 500) {
          errorTitle = 'Server Error';
          errorMessage = 'Something went wrong on our end. Please try again later or contact support.';
        } else {
          if (error.error && error.error.message) {
             errorMessage = error.error.message;
          } else if (typeof error.error === 'string') {
             errorMessage = error.error;
          }
        }
      }

      if (!skipAlert) {
        // Show user-friendly SweetAlert instead of technical jargon
        swalService.error(errorTitle, errorMessage);
      }

      return throwError(() => error);
    })
  );
};

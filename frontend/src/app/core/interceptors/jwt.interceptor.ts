import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorMessage = typeof error.error === 'string' ? error.error : error.error?.error;

      // Handle Ban action
      if (error.status === 403 && errorMessage === 'Your account has been banned.') {
        auth.logout(); // Clears storage, resets signal, and navigates to login
        return throwError(() => error);
      }

      // Handle Deleted user action
      if (error.status === 401 && (errorMessage === 'User no longer exists.' || error.error?.error === 'User no longer exists.')) {
        auth.logout(); // Clears storage, resets signal, and navigates to login
        return throwError(() => null); 
      }

      return throwError(() => error);
    })
  );
};
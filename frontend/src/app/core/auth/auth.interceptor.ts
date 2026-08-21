import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Functional HTTP Interceptor that attaches the JWT Bearer token to outgoing API requests
 * and intercepts 401 Unauthorized errors to trigger automatic logout.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token();

  let authReq = req;

  // Attach token to outgoing API requests if available
  if (token && !req.url.includes('/api/auth/')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Automatic session termination upon receiving 401 Unauthorized
      if (error.status === 401 && !req.url.includes('/api/auth/login')) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles = route.data['roles'] as Array<string>;
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    const userRole = user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (expectedRoles && expectedRoles.length > 0 && !expectedRoles.includes(userRole)) {
      this.router.navigate(['/dashboard']); 
      return false;
    }

    return true;
  }
}

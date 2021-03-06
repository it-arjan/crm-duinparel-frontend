import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router/src/utils/preactivation';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UIService } from './ui.service';
import { AuthBase } from './base/auth.base.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private _auth: AuthBase, 
    private _ui: UIService, 
    private router: Router) { 
      console.log('constructor AuthGuardService')
  }
  
  //path, route are also required for canactivate interface
  path
  route 

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this._auth.isAuthenticated()) {
      this._ui.info('Selecteer de login tab om in te loggen..')
      this.router.navigate(['/settings']);
      return false;
    }
    return true;
  }
}


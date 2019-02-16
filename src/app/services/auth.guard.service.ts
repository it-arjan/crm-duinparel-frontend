import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router/src/utils/preactivation';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BackendService } from './backend.service';
import { UIService } from './ui.service';
import { timingSafeEqual } from 'crypto';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private _bs: BackendService, 
    private _ui: UIService, 
    private router: Router) { 
      console.log('constructor AuthGuardService')
  }
  authenticated=false
    //required for canactivate interface
  path
  route 
  authenticated_should_be_here_not_in_bs = false
  canActivate(): boolean {
    if (!this._bs.isAuthenticated()) {
      this._ui.info('Selecteer de login tab om in te loggen..')
      this.router.navigate(['/settings']);
      return false;
    }
    return true;
  }
}


import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router/src/utils/preactivation';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BackendService } from './backend.service';
import { UIService } from './ui.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private _bs: BackendService, 
    private _ui: UIService, 
    private router: Router) { }
  path //required for canactivate interface
  route //required for canactivate interface
  canActivate(): boolean {
    if (this._bs.isAuthenticated()) {
        return true;
    } else {
      this._ui.info('onderaan de pagina aub inloggen..')
      this.router.navigate(['/settings']);
    }
    return false;
  }
}


import { Injectable } from '@angular/core';
import { iAuth, iAuthResult, changePwdInput } from './interfaces.auth';
import { ElectronService } from 'ngx-electron';
import { UIService } from './ui.service';
import { AuthBase } from './auth.base.service';
import { Globals } from '../shared/globals';

@Injectable()
export class AuthFakeService extends AuthBase {
  constructor() { 
    super()
    this.raiseAuthCompleted(true)
  }
  
  isAuthenticated(): boolean {
    //this._ui.info('running fake auth')
    return true
  }

  logOn(pwd: string): Promise<string> {
    let promise=  new Promise<string>((resolve, reject) => {
      let result = ''
      setTimeout(() => {
        resolve(result)
      }, Globals.computeDelay()); 
    })
    return promise
  }

  changePassword(oldpass: string, newpass: string): Promise<iAuthResult> {
    let promise=  new Promise<iAuthResult>((resolve, reject) => {
      let result:iAuthResult = {success: true, error: null}
      setTimeout(() => {
        resolve(result)
      }, Globals.computeDelay()); 
    })
    return promise
  }
}

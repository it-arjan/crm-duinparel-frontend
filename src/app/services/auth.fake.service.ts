import { Injectable } from '@angular/core';
import { iAuth, iAuthResult, changePwdInput } from './interfaces.auth';
import { ElectronService } from 'ngx-electron';
import { UIService } from './ui.service';
import { AuthBase } from './auth.base.service';

@Injectable()
export class AuthFakeService extends AuthBase {
  constructor(
    private _es: ElectronService,
  ) { 
        super()
  }
  
 //exec all methods with random delay between 0-2sec
  computeDelay(): number {
    let result:number=Math.random() * 2000
    return result
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
        }, this.computeDelay()); 
      })
      return promise
    }
  changePassword(oldpass: string, newpass: string): Promise<iAuthResult> {
      let promise=  new Promise<iAuthResult>((resolve, reject) => {
        let result:iAuthResult = {success: true, error: null}
        setTimeout(() => {
          resolve(result)
        }, this.computeDelay()); 
      })
      return promise
  }
}

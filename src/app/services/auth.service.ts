import { Injectable } from '@angular/core';
import { iSecurity, securityResult, changePwdInput } from './interfaces.security';
import { ElectronService } from 'ngx-electron';
import { UIService } from './ui.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements iSecurity {
  constructor(
    private _es: ElectronService,
  ) { }
  
authenticated:boolean
  isAuthenticated() : boolean {
    //console.log('====>isAuthenticated: ' + this.authenticated)
    return this.authenticated
  }

 logOn(pwd:string): Promise<string>{
    let result: Promise<string> =  new Promise<string>((resolve, reject) => {
    this._es.ipcRenderer.once('LogonResponse', (event: Electron.IpcMessageEvent, result: securityResult) => {
      console.log('service.logon.result=' + result.success)
      if (result.success) {
        this.authenticated=true
        resolve('')
      }
      else {
        console.log('logon failed: ' + result.error)
        reject(result.error)
      }
      })//once
    })//promise
    
    //console.log( 'backend service: sending pwd ' + pwd)
    this._es.ipcRenderer.send('Logon', pwd)
    return result
  }

  changePassword(oldpass:string, newpass:string) : Promise<securityResult>{
    //console.log('subscribe to ChangepasswordResponse')
    let result: Promise<securityResult> =  new Promise<securityResult>((resolve, reject) => {
      this._es.ipcRenderer.once('ChangePasswordResponse', (event: Electron.IpcMessageEvent, result: securityResult) => {
        console.log('ChangePasswordResponse!!');
        if (result.success)
        {
          resolve(result)
        }
        else reject(result)
      })
    })

    //console.log('send RecryptDbSecret event to ipcMain..')
    //this.settings[0].value='changed'
    let pwds: changePwdInput = {oldpwd:oldpass, newpwd:newpass}
    this._es.ipcRenderer.send('ChangePassword', pwds)
    return result;
  } 
}

import { Injectable } from '@angular/core';
import { iAuth, iAuthResult, changePwdInput } from './interfaces.auth';
import { ElectronService } from 'ngx-electron';
import { UIService } from './ui.service';
import { AuthBase } from './auth.base.service';

@Injectable()
export class AuthService extends AuthBase {
  constructor(
    private _es: ElectronService,
  ) { 
    super()
  }
  
authenticated:boolean
  isAuthenticated() : boolean {
    //console.log('====>isAuthenticated: ' + this.authenticated)
    return this.authenticated
  }

 logOn(pwd:string): Promise<string>{
    let result: Promise<string> =  new Promise<string>((resolve, reject) => {
    this._es.ipcRenderer.once('LogonResponse', (event: Electron.IpcMessageEvent, result: iAuthResult) => {
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

  changePassword(oldpass:string, newpass:string) : Promise<iAuthResult>{
    //console.log('subscribe to ChangepasswordResponse')
    let result: Promise<iAuthResult> =  new Promise<iAuthResult>((resolve, reject) => {
      this._es.ipcRenderer.once('ChangePasswordResponse', (event: Electron.IpcMessageEvent, result: iAuthResult) => {
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

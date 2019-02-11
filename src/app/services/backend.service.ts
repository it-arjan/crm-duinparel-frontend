import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ConfigSetting } from '../models/configsetting.model';
import { UIService } from './ui.service';
import { Customer } from '../models/customer.model';
import { Booking } from '../models/booking.model';
import { setCurrentQueries } from '@angular/core/src/render3/state';
import { LogEntry } from '../models/logentry.model';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    private _es: ElectronService,
    private _ui: UIService,
    ) { }

  private _userPassword: string
  pwdCorrect(pwd:string){
    console.log(this._userPassword, pwd)
    return this._userPassword === pwd
  }
  isAuthenticated() : boolean {
    return this._userPassword && this._userPassword.length > 5
  }
  readConfig(): Promise<ConfigSetting[]>{
    //subscribe
    console.log('readConfig:')
    let result: Promise<ConfigSetting[]> = new Promise((resolve, reject) => {
      //console.log('subscribe to ReadConfigResponse')
      this._es.ipcRenderer.once('ReadConfigResponse', (event: Electron.IpcMessageEvent, arg: ConfigSetting[]) => {
      //console.log('ReadConfigResponse!!');
      if (arg) resolve(arg);
      else reject([])
      })
    })

  //console.log('send ReadConfig event to ipcMain..')
  this._es.ipcRenderer.send('ReadConfig')
  return result;
  }
  test(){
    this._es.ipcRenderer.once('TestResponse', (event: Electron.IpcMessageEvent, result: Customer) => {
      console.log('TestResponse!!');
      console.log(result)
      let x:Customer = new Customer(result.id, result.name, result.address,result.email, result.iban, new Array<Booking>())
      result.bookings.forEach((bt:Booking)=>{
        x.consumeBookingClone(bt)
      })
      console.log(x)
      x.test()
    })
    this._es.ipcRenderer.send('Test')
  }
  
writeWordBooking(customer:Customer, booking:Booking): Promise<{wordFilename:string, wordFolder:string}>{
  let promise = new Promise<{wordFilename:string, wordFolder:string}>((resolve, reject)=>{
    this._es.ipcRenderer.once('WordBookingResponse', (event: Electron.IpcMessageEvent, fileStats: {wordFilename:string, wordFolder:string}) => {
      console.log('WordBookingResponse!!');
      if (fileStats.wordFilename != 'error') resolve(fileStats)
      else reject(fileStats)
    })
  })
  this._es.ipcRenderer.send('WordBooking', {customer:customer, booking:booking})
  return promise
}

getLogs(): Promise<Array<LogEntry>>{
    
  let promise: Promise<Array<LogEntry>> =  new Promise<Array<LogEntry>>((resolve, reject) => {
    this._es.ipcRenderer.once('GetLogsResponse', (event: Electron.IpcMessageEvent, result: Array<LogEntry>) => {
   console.log('GetLogsResponse!!');
   if (result) 
   {
     let result2 = result.map( x=> new LogEntry(x.fileName, x.modified, x.fileContents))
     resolve(result2)
   }
   else reject({name:'errorrr', contents:'we krijgen niets terug vanuit de backend, zeer ongebruikelijk!'})
 })
 })

 //console.log('send RecryptDbSecret event to ipcMain..')
 //this.settings[0].value='changed'
 this._es.ipcRenderer.send('GetLogs')
 return promise;
}
logOn(pwd:string): Promise<void>{
  let result: Promise<void> =  new Promise((resolve, reject) => {
  this._es.ipcRenderer.once('LogonResponse', (event: Electron.IpcMessageEvent, success: boolean) => {
    console.log('service.logon.result=' + success)
    if (success) {
      this._userPassword=pwd
      resolve()
    }
    else reject()
    })//once
  })//promise
  
  //console.log( 'backend service: sending pwd ' + pwd)
  this._es.ipcRenderer.send('Logon', pwd)
  return result
}
changePassword(oldpass:string, newpass:string) : Promise<boolean>{
  //console.log('subscribe to ChangepasswordResponse')
  let result: Promise<boolean> =  new Promise<boolean>((resolve, reject) => {
     this._es.ipcRenderer.once('ChangePasswordResponse', (event: Electron.IpcMessageEvent, result: string) => {
    console.log('ChangePasswordResponse!!');
    if (result) 
    {
      this._userPassword = newpass
      resolve(true)
    }
    else reject(false)
  })
  })

  //console.log('send RecryptDbSecret event to ipcMain..')
  //this.settings[0].value='changed'
  let pwds = {oldpwd:oldpass, newpwd:newpass}
  this._es.ipcRenderer.send('ChangePassword', pwds)
  return result;
}

writeConfig(settings:ConfigSetting[]){
  //subscribe
  console.log('subscribe to WriteConfigResponse')
  this._es.ipcRenderer.once('WriteConfigResponse', (event: Electron.IpcMessageEvent, result: string) => {
    console.log('WriteConfigResponse!!');
    if (result === 'success') 
    {
      console.log('WriteConfigResponse :: SUCCESS');
      this._ui.success()
    }
    else this._ui.error("Error writing config: " + result)
});  

//console.log('send WriteConfig event to ipcMain..')
this._es.ipcRenderer.send('WriteConfig', settings)
}
}

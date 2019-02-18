import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ConfigSetting } from '../models/configsetting.model';
import { UIService } from './ui.service';
import { Customer } from '../models/customer.model';
import { Booking } from '../models/booking.model';
import { LogEntry } from '../models/logentry.model';
import { ReplaySubject } from 'rxjs';
import { Mailing } from '../models/mailing.model';
import { iDataService, tBulkdataResult, tDataResult, tPersist, tDataResultNodejs, tPersistMailing, tPersistCustomer, tPersistbooking } from './interfaces.data';
//import { reject } from 'q';
import { changePwdInput, securityResult, iSecurity } from './interfaces.security';

@Injectable({
  providedIn: 'root'
})

export class BackendService implements iDataService, iSecurity {

  constructor(
    private _es: ElectronService,
    private _ui: UIService,
    ) { 
      console.log('constructor BackendService')
    }

  private getData_R$ : ReplaySubject<tBulkdataResult>
  private persistCust_R$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
  private persistBook_R$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
  private persistMail_R$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
  //TODO public authResult_R$: ReplaySubject<securityResult> = new ReplaySubject<securityResult>()
  private authenticated4Authguard = false //todo check why subscribing doesn;t work (suspect serice creation order)

  isAuthenticated() : boolean {
    console.log('====>isAuthenticated: ' + this.authenticated4Authguard)
    return this.authenticated4Authguard
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

  testDb(){
    this._es.ipcRenderer.once('TestDbResponse', (event: Electron.IpcMessageEvent, result: boolean) => {
      console.log('TestDbResponse!!');
      console.log(result)
  
    })
    this._es.ipcRenderer.send('TestDb')
  }

  checkPlatform(){
    if(!this._es.isElectronApp) {
      throw new Error('NodeJs cann only be approached in electron app.')
    }
  }

  getData(): ReplaySubject<tBulkdataResult> {
    this.checkPlatform();
    this.getData_R$ = new ReplaySubject<tBulkdataResult>(1);
    this._es.ipcRenderer.once('GetDataResponse', 
      (event: Electron.IpcMessageEvent, data: tBulkdataResult) => {
        console.log("GetDataResponse!!!")
        
        //convert it
        let angcustomers = data.customers.map(jsCust => {
          let angCust = Customer.consumejsCustomerDeep(jsCust)
          return angCust
        })
        let angmailings = data.mailings.map(jsmail => {
          let angmail = Mailing.consumeNodedata(jsmail)
          return angmail
        })        
        let angResult:tBulkdataResult ={customers:null, mailings:null, error:''}
        angResult.customers=angcustomers
        //angResult.mailings=angmailings
      this.getData_R$.next(data)
    })
    this._es.ipcRenderer.send('GetData')
    return this.getData_R$
  }

  cleanupDataCache() {
    this.getData_R$.complete()
    this.getData_R$= new ReplaySubject<tBulkdataResult>()
  }
  
  
  persistCustomer(customer: Customer, type: tPersist) :  ReplaySubject<tDataResult> {
    this.checkPlatform();
    this._es.ipcRenderer.once('PersistCustomerResponse', (event: Electron.IpcMessageEvent, result: tDataResultNodejs) => {
      if (type === tPersist.Insert) {
        customer.id= result.generatedId
      }
      this.persistCust_R$.next({error:result.error})
    })
    let arg: tPersistCustomer = {customer: customer, persistType:tPersist[type]}
    this._es.ipcRenderer.send('PersistCustomer', arg)
    return this.persistCust_R$
  }

  persistBooking(booking:Booking, type: tPersist): ReplaySubject<tDataResult>{
    //platform check
    this.checkPlatform();
    //subscribe first
    this._es.ipcRenderer.once('PersistBookingResponse', (event: Electron.IpcMessageEvent, result: tDataResultNodejs) => {
      console.log('StoreBookingResponse!!');
      console.log(result)
      if (type === tPersist.Insert) {
        booking.id= result.generatedId
      }
      this.persistBook_R$.next(result)
    })
    //call to ipcMain
    let arg: tPersistbooking = {booking: booking, persistType:tPersist[type]}
    this._es.ipcRenderer.send('PersistBooking', arg)
     return this.persistBook_R$
 }
 
  persistMailing(mailing: Mailing, type: tPersist) : ReplaySubject<tDataResult>{
    this.checkPlatform();
    this._es.ipcRenderer.once('PersistMailingResponse', (event: Electron.IpcMessageEvent, result: tDataResultNodejs) => {
      console.log('PersistBookingResponse!!');
      console.log(result)
      if (type === tPersist.Insert) {
        mailing.id= result.generatedId
      }
        this.persistBook_R$.next(result)
      })
    //call to ipcMain
    let arg : tPersistMailing = {mailing: mailing, persistType:tPersist[type]}
    this._es.ipcRenderer.send('PersistMailing', arg)
    return this.persistMail_R$
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

  getLogs(): Promise<Array<LogEntry>> {  
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
    this._es.ipcRenderer.once('LogonResponse', (event: Electron.IpcMessageEvent, success: securityResult) => {
      console.log('service.logon.result=' + success)
      if (success) {
        this.authenticated4Authguard=true
        resolve()
      }
      else reject()
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

  writeConfig(settings:ConfigSetting[]){
    //subscribe
    console.log('subscribe to WriteConfigResponse')
    this._es.ipcRenderer.once('WriteConfigResponse', (event: Electron.IpcMessageEvent, result: string) => {
      console.log('WriteConfigResponse!!');
      if (result === 'success') 
      {
        console.log('WriteConfigResponse :: SUCCESS');
        this._ui.successIcon()
      }
      else this._ui.error("Error writing config: " + result)
    })

  //console.log('send WriteConfig event to ipcMain..')
  this._es.ipcRenderer.send('WriteConfig', settings)
  }
}

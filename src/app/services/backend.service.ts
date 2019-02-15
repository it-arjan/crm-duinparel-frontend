import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ConfigSetting } from '../models/configsetting.model';
import { UIService } from './ui.service';
import { Customer } from '../models/customer.model';
import { Booking } from '../models/booking.model';
import { setCurrentQueries } from '@angular/core/src/render3/state';
import { LogEntry } from '../models/logentry.model';
import { Observable, from, ReplaySubject } from 'rxjs';
import { Mailing } from '../models/mailing.model';
import { iDataService, tBulkdataResult, tDataResult, tPersist, tDataResultBackend, tPersistMailing, tPersistCustomer, tPersistbooking } from './data.service.interfaces';
import { reject } from 'q';

@Injectable({
  providedIn: 'root'
})

export class BackendService implements iDataService {

  constructor(
    private _es: ElectronService,
    private _ui: UIService,
    ) { }

  private _userPassword: string
  private getData_R$ : ReplaySubject<tBulkdataResult>
  private persistCust_R$ : ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
  private persistBook_R$ : ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
  private persistMail_R$ : ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()

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

  getDataFromBackend(): ReplaySubject<tBulkdataResult> {
    this.checkPlatform();
    this.getData_R$ = new ReplaySubject<tBulkdataResult>(1);
    this._es.ipcRenderer.once('GetDataResponse', 
      (event: Electron.IpcMessageEvent, data: tBulkdataResult) => {
        console.log("GetDataResponse!!!")
        console.log(data)
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
    this._es.ipcRenderer.once('PersistCustomerResponse', (event: Electron.IpcMessageEvent, result: tDataResultBackend) => {
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
    this._es.ipcRenderer.once('PersistBookingResponse', (event: Electron.IpcMessageEvent, result: tDataResultBackend) => {
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
    this._es.ipcRenderer.once('PersistMailingResponse', (event: Electron.IpcMessageEvent, result: tDataResultBackend) => {
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
  

  getData_Promises_NotUsed() : Promise<{'customers':Array<Customer>, 'mailings': Array<Mailing>}> {
    var promise: Promise<any> = new Promise<{'customers':Array<Customer>, 'mailings': Array<Mailing>}>((resolve,reject) => {
    this._es.ipcRenderer.on('GetAllDataResponse', 
        (event: Electron.IpcMessageEvent, data: {'customers':Array<Customer>, 'mailings': Array<Mailing>}) => {
          //console.log("GetAllDataResponse!!!")
          //console.log(data)
          resolve(data)
      })
    })
    .catch((err)=>{
      this._ui.error("error fetching data, check the logs")
      reject(new Error("Error getting data" + err))
    })

    this._es.ipcRenderer.send('GetAllData')
    return promise
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
    })

  //console.log('send WriteConfig event to ipcMain..')
  this._es.ipcRenderer.send('WriteConfig', settings)
  }
}

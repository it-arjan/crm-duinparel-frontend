import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ConfigSetting } from '../models/configsetting.model';
import { UIService } from './ui.service';
import { Customer } from '../models/customer.model';
import { Booking } from '../models/booking.model';
import { LogEntry } from '../models/logentry.model';

@Injectable({
  providedIn: 'root'
})

export class BackendService {

  constructor(
    private _es: ElectronService,
    private _ui: UIService,
    ) { 
      console.log('constructor BackendService')
    }

  //TODO public authResult_R$: ReplaySubject<securityResult> = new ReplaySubject<securityResult>()

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

  checkPlatform(){
    if(!this._es.isElectronApp) {
      throw new Error('NodeJs cann only be approached in electron app.')
    }
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



  
}

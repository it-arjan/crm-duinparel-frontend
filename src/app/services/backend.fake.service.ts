import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ConfigSetting } from '../models/configsetting.model';
import { UIService } from './ui.service';
import { Customer } from '../models/customer.model';
import { Booking } from '../models/booking.model';
import { LogEntry } from '../models/logentry.model';
import { iBackendTasks } from './interfaces.backend';
import { Globals } from '../shared/globals';
import { BackendBase } from './backend.base.service';


@Injectable()

export class BackendFakeService extends BackendBase {
  constructor(){
    super()
  }
  /// ================= iBackendTasks ====================
  readConfig(): Promise<ConfigSetting[]> {
    let promise: Promise<ConfigSetting[]> =  new Promise<ConfigSetting[]>((resolve, reject) => {
      let result: ConfigSetting[] = [new ConfigSetting('You are running','on a fake backend!', null)]
      setTimeout(() => {
          resolve(result)
        }, Globals.computeDelay());
    })
    return promise
  }
  
  writeConfig(settings: ConfigSetting[]) {
    console.log("writeConfig not implemented in fake backend.");
  }

  writeWordBooking(customer: Customer, booking: Booking): Promise<{ wordFilename: string, wordFolder: string; }> {
    let promise =  new Promise<{ wordFilename: string, wordFolder: string }>((resolve, reject) => {
      setTimeout(() => {
        resolve({ wordFilename: 'writeWordBooking not implemented', wordFolder: 'in fake backend.' })
      }, Globals.computeDelay());
    })
    return promise
  }

  getLogs(): Promise<LogEntry[]> {
    let promise =  new Promise<LogEntry[]>((resolve, reject) => {
      let result = [new LogEntry('fake file','','No log files in a fake backend!')]
      setTimeout(() => {
        resolve(result)
      }, Globals.computeDelay());
    })
    return promise    
  }  
  
  exitProgram(){
    //do nothing
  }
  
}

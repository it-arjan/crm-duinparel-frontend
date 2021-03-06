import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ConfigSetting } from '../../models/configsetting.model';
import { UIService } from '../ui.service';
import { Customer } from '../../models/customer.model';
import { Booking } from '../../models/booking.model';
import { LogEntry } from '../../models/logentry.model';
import { iBackendTasks } from '../interfaces/interfaces.backend';


@Injectable()

export abstract class BackendBase implements iBackendTasks {

  abstract readConfig(): Promise<ConfigSetting[]>
  abstract writeConfig(settings:ConfigSetting[])
  abstract writeWordBooking(customer:Customer, booking:Booking): Promise<{wordFilename:string, wordFolder:string}>
  abstract getLogs(): Promise<Array<LogEntry>> 
  abstract exitProgram()
  
}

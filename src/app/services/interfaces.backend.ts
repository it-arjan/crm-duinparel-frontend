import { ConfigSetting } from '../models/configsetting.model';
import { Customer } from '../models/customer.model';
import { Booking } from '../models/booking.model';
import { LogEntry } from '../models/logentry.model';

export interface iBackendTasks {
    readConfig(): Promise<ConfigSetting[]>
    writeConfig(settings:ConfigSetting[])
    writeWordBooking(customer:Customer, booking:Booking): Promise<{wordFilename:string, wordFolder:string}>
    getLogs(): Promise<Array<LogEntry>> 
}
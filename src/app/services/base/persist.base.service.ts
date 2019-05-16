import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { tBulkdataResult, tDataResult, iDataPersist, tPersist, tDataResultNodejs, tPersistBag } from '../interfaces/interfaces.persist';
import { Customer } from '../../models/customer.model';
import { ElectronService } from 'ngx-electron';
import { Mailing } from '../../models/mailing.model';
import { Booking } from '../../models/booking.model';
import { UIService } from '../ui.service';

@Injectable()
export abstract class PersistBase  implements iDataPersist {

   abstract getData(): ReplaySubject<tBulkdataResult>
   abstract persistCustomer(cust: Customer, type: tPersist): ReplaySubject<tDataResult>
   abstract persistBooking(book: Booking, type: tPersist): ReplaySubject<tDataResult>
   abstract persistMailing(mail: Mailing, type: tPersist): ReplaySubject<tDataResult>
   abstract cleanupDataCache()
}

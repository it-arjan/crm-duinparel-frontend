import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { tBulkdataResult, tDataResult, iDataPersist, tPersist, tDataResultNodejs, tPersistBag } from './interfaces.persist';
import { Customer } from '../models/customer.model';
import { ElectronService } from 'ngx-electron';
import { Mailing } from '../models/mailing.model';
import { Booking } from '../models/booking.model';
import { UIService } from './ui.service';
import { Globals } from '../shared/globals';
import { PersistBase } from './persist.base.service';

@Injectable()
export class PersistFakeService  extends PersistBase {
  constructor(){
    super()
  }
  
  customers: Customer[]
  mailings: Mailing[]
  
  private dataReplay : ReplaySubject<tBulkdataResult>
  
  getData(): ReplaySubject<tBulkdataResult> {
    console.log('fake getData')
    //this._ui.info('fake Data') //todo, make it possible to add send msgs

    if (!this.customers) this.createData()
    if(!this.dataReplay) this.dataReplay = new ReplaySubject<tBulkdataResult>()

    setTimeout(x=> this.dataReplay.next({customers: this.customers, mailings: this.mailings, error: null}), Globals.computeDelay()) 
    
    return this.dataReplay
  }
  
  persistCustomer(cust: Customer, type: tPersist): ReplaySubject<tDataResult>  {
    let result: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
    // create new id on insert
    if (type === tPersist.Insert) 
      cust.id=this.getNextAvailableCustId()
    
    setTimeout(x=> {
      result.next({error: null})
    }, Globals.computeDelay()) 
    
    return result
  }

  persistBooking(book: Booking, type: tPersist): ReplaySubject<tDataResult>  {
     let result: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
   //we dont use booking.id in FE
    setTimeout(() => {
      result.next({error: null})
    }, Globals.computeDelay())

    return result
  }

  persistMailing(mail: Mailing, type: tPersist): ReplaySubject<tDataResult> {
    let result: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
    //set a new id on insert
    if (type === tPersist.Insert) mail.id = this.getNextAvailableMailingId()

    setTimeout(() => {
      result.next({error: null})
    }, Globals.computeDelay());

    return result
  }

  cleanupDataCache(){
    this.dataReplay = null
  }
  
  private createData(){
    this.customers=[]
    this.mailings=[]
    let bookings: Booking[]=[];
    bookings.push(new Booking( 1, 1, new Date("03/25/2015").getTime(), new Date("03/28/2015").getTime(), 2 ,'jvg', 'week'))
    bookings.push(new Booking( 2, 1, new Date("04/25/2014").getTime(), new Date("04/28/2014").getTime(), 2,'jvg', 'week'))
    this.customers.push(new Customer(1,'jan jansen','bloemstraat 13, 1232 AJ, rotterdam', 'jjanse.huismens@hotmail.com', '06-1035289','NL', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 3, 2, new Date("03/25/2018").getTime(), new Date("03/28/2018").getTime(), 2,'jvg', 'weekend'))
    bookings.push(new Booking( 4, 2, new Date("04/25/2018").getTime(), new Date("04/28/2018").getTime(), 2,'alb', 'weekend'))
    bookings.push(new Booking( 5, 2, new Date("08/25/2018").getTime(), new Date("08/28/2018").getTime(), 2,'jvg', 'weekend'))
    bookings.push(new Booking( 6, 2, new Date("11/25/2018").getTime(), new Date("11/28/2018").getTime(), 2, 'jvg', 'weekend'))
    this.customers.push(new Customer(2,'jan doedel','dopperstraat 13, 1232 AJ, tsjietjerkstadeel', 'j.d.huismens@xs4all.nl', '06-1035289','NL', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 7, 3, new Date("03/25/2015").getTime(), new Date("03/28/2015").getTime(), 2,'alb', 'week'))
    bookings.push(new Booking( 8, 3, new Date("05/15/2014").getTime(), new Date("05/22/2014").getTime(), 2,'jvg', 'week'))
    this.customers.push(new Customer(3,'bert pietersen','jan steenstraat 13, 1000 TA, amsterdam', 'bepie.huismens@outlook.com', '06-1035289','DE', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 9, 4, new Date("03/25/2015").getTime(), new Date("03/28/2015").getTime(), 2,'app', 'midweek'))
    bookings.push(new Booking( 10, 4, new Date("03/25/2014").getTime(), new Date("03/28/2014").getTime(), 2,'app', 'midweek'))
    this.customers.push(new Customer(4,'karel van appman','hoofdweg 33, 1013 XA, harlingen', 'kbeene.appmens@xs4all.nl', '06-1035289','DE', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 11, 5, new Date("03/25/2017").getTime(), new Date("03/28/2017").getTime(), 2,'app', 'midweek'))
    bookings.push(new Booking( 12, 5, new Date("03/25/2018").getTime(), new Date("03/28/2018").getTime(), 2,'app', 'midweek'))
    this.customers.push(new Customer(5,'M dawohl','hptwg 33, 10134, colon', 'd.wohl.appmens@grundlich.de', '06-1035289','DE', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 13, 6, new Date("09/24/2017").getTime(), new Date("09/28/2017").getTime(), 2,'app', 'midweek'))
    bookings.push(new Booking( 14, 6, new Date("08/18/2018").getTime(), new Date("08/14/2018").getTime(), 2,'app', 'midweek'))
    this.customers.push(new Customer(6,'K debringer','mittelweg 34, 10123, hamburg', 'k.debringer.appmens@gmx.de', '06-1035289','NL', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 15, 7, new Date("06/23/2017").getTime(), new Date("06/29/2017").getTime(), 2,'alb', 'midweek'))
    bookings.push(new Booking( 16, 7, new Date("06/23/2018").getTime(), new Date("06/29/2018").getTime(), 2,'jvg', 'midweek'))
    this.customers.push(new Customer(7,'JJ','main st 33, 10134, london', 'aka.jj.huismens@heaven.co.uk', '06-1035289','NL', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 17, 8, new Date("04/23/2017").getTime(), new Date("04/29/2017").getTime(), 2,'alb', 'midweek'))
    bookings.push(new Booking( 18, 8, new Date("08/14/2018").getTime(), new Date("08/21/2018").getTime(), 2,'jvg', 'week'))
    this.customers.push(new Customer(8,'mr. Smith','22nd st 33374, 1013423, NYC', 'smith-wesson.huismens@nra.com', '06-1035289','USA', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 19, 9, new Date("04/23/2017").getTime(), new Date("04/29/2017").getTime(), 2,'alb', 'midweek'))
    bookings.push(new Booking( 20, 9, new Date("06/14/2018").getTime(), new Date("06/21/2018").getTime(), 2,'jvg', 'week'))
    this.customers.push(new Customer(9,'mss. Jones','23rd st 23532, 101312323, NYC', 'jonejone.huismens@usa.today', '06-1035289','USA', bookings))

    let custIds: number[] = []
    custIds =[1,2,3,4,5]
    this.mailings.push(new Mailing(1, new Date("10/23/2018").getTime(), 'contains cust ids 1-5', custIds))

    custIds =[6,7,8,9]
    this.mailings.push(new Mailing(1, new Date("04/23/2017").getTime(), 'contains cust ids 6.9', custIds))
    
  }
  private getNextAvailableCustId(): number{
    let maxId=0
    this.customers.forEach(x=> maxId = (x.id > maxId ? x.id : maxId))
    return maxId + 1
  }
  private getNextAvailableMailingId(): number{
    let maxId=0
    this.mailings.forEach(x=> maxId = (x.id > maxId ? x.id : maxId))
    return maxId + 1
  }
}

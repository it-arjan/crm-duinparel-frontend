import { Injectable } from '@angular/core';
import { iDataService,tBulkdataResult, tDataResult, tPersist } from './data.service.interfaces';
import { Customer } from '../models/customer.model';
import { Booking } from '../models/booking.model';
import { Mailing } from '../models/mailing.model';
import { Observable, Observer, ReplaySubject } from 'rxjs';
import { createLViewData } from '@angular/core/src/render3/instructions';

@Injectable({
  providedIn: 'root'
})
export class FakeBackendService implements iDataService {
  
  constructor() { 
  
  }
  customers: Customer[]
  mailings: Mailing[]

  createData(){
    this.customers=[]
    this.mailings=[]
    let bookings: Booking[]=[];
    bookings.push(new Booking( 1, 1, new Date("03/25/2015"), new Date("03/28/2015"),'jvg', 'week'))
    bookings.push(new Booking( 2, 1, new Date("04/25/2014"), new Date("04/28/2014"),'jvg', 'week'))
    this.customers.push(new Customer(1,'jan jansen aka 1','bloemstraat 13, 1232 AJ, rotterdam', 'jjanse@hotmail.com','0034ngb1246345923', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 3, 2, new Date("03/25/2018"), new Date("03/28/2018"),'jvg', 'weekend'))
    bookings.push(new Booking( 4, 2, new Date("04/25/2018"), new Date("04/28/2018"),'alb', 'weekend'))
    bookings.push(new Booking( 5, 2, new Date("08/25/2018"), new Date("08/28/2018"),'jvg', 'weekend'))
    bookings.push(new Booking( 6, 2, new Date("11/25/2018"), new Date("11/28/2018"),'jvg', 'weekend'))
    this.customers.push(new Customer(2,'jan doedel aka 2','dopperstraat 13, 1232 AJ, tsjietjerkstadeel', 'j.d@xs4all.nl','', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 7, 3, new Date("03/25/2015"), new Date("03/28/2015"),'alb', 'week'))
    bookings.push(new Booking( 8, 3, new Date("05/15/2014"), new Date("05/22/2014"),'jvg', 'week'))
    this.customers.push(new Customer(3,'bert pietersen aka 3','jan steenstraat 13, 1000 TA, amsterdam', 'bepie@outlook.com','0031ingb0475860', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 9, 4, new Date("03/25/2015"), new Date("03/28/2015"),'app', 'midweek'))
    bookings.push(new Booking( 10, 4, new Date("03/25/2014"), new Date("03/28/2014"),'app', 'midweek'))
    this.customers.push(new Customer(4,'karel van appman aka 4','hoofdweg 33, 1013 XA, harlingen', 'kbeene.appmens@xs4all.nl','0031ingb017482225', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 11, 5, new Date("03/25/2017"), new Date("03/28/2017"),'app', 'midweek'))
    bookings.push(new Booking( 12, 5, new Date("03/25/2018"), new Date("03/28/2018"),'app', 'midweek'))
    this.customers.push(new Customer(5,'M dawohl aka 5','hptwg 33, 10134, colon', 'd.wohl.appmens@grundlich.de','', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 13, 6, new Date("09/24/2017"), new Date("09/28/2017"),'app', 'midweek'))
    bookings.push(new Booking( 14, 6, new Date("08/18/2018"), new Date("08/14/2018"),'app', 'midweek'))
    this.customers.push(new Customer(6,'K debringer aka 6','mittelweg 34, 10123, hamburg', 'k.debringer.appmens@gmx.de','', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 15, 7, new Date("06/23/2017"), new Date("06/29/2017"),'alb', 'midweek'))
    bookings.push(new Booking( 16, 7, new Date("06/23/2018"), new Date("06/29/2018"),'jvg', 'midweek'))
    this.customers.push(new Customer(7,'JJ aka 7','main st 33, 10134, london', 'aka.jj@heaven.co.uk','', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 17, 8, new Date("04/23/2017"), new Date("04/29/2017"),'alb', 'midweek'))
    bookings.push(new Booking( 18, 8, new Date("08/14/2018"), new Date("08/21/2018"),'jvg', 'week'))
    this.customers.push(new Customer(8,'ms Smith aka 8','22nd st 33374, 1013423, NYC', 'smith-wesson@nra.com','', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 19, 9, new Date("04/23/2017"), new Date("04/29/2017"),'alb', 'midweek'))
    bookings.push(new Booking( 20, 9, new Date("06/14/2018"), new Date("06/21/2018"),'jvg', 'week'))
    this.customers.push(new Customer(9,'ms Jones aka 9','23rd st 23532, 101312323, NYC', 'jonejone@usa.today','', bookings))

    let custIds: number[] = []
    custIds =[1,2,3,4,5]
    this.mailings.push(new Mailing(1, new Date("10/23/2018"), 'contains cust ids 1-5', custIds))

    custIds =[6,7,8,9]
    this.mailings.push(new Mailing(1, new Date("04/23/2017"), 'contains cust ids 6.9', custIds))
    
  }
  getNextAvailableCustId(): number{
    let maxId=0
    this.customers.forEach(x=> maxId = (x.id > maxId ? x.id : maxId))
    return maxId + 1
  }
  getNextAvailableMailingId(): number{
    let maxId=0
    this.mailings.forEach(x=> maxId = (x.id > maxId ? x.id : maxId))
    return maxId + 1
  }
  
  private dataReplay : ReplaySubject<tBulkdataResult>

  getDataFromBackend(): ReplaySubject<tBulkdataResult> {
    console.log('fake getData')
    if (!this.customers) this.createData()
    if(!this.dataReplay) this.dataReplay = new ReplaySubject<tBulkdataResult>()

    setTimeout(x=> this.dataReplay.next({customers: this.customers, mailings: this.mailings, error: null}), 2000) 
    
    return this.dataReplay
  }
  
  private custReplay : ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
  persistCustomer(cust: Customer, type: tPersist): ReplaySubject<tDataResult>  {
    // create new id on insert
    if (type === tPersist.Insert) 
      cust.id=this.getNextAvailableCustId()
    
    setTimeout(x=> {
      this.custReplay.next({error: null})
    }, 2000) 
    return this.custReplay
  }

  private bookReplay : ReplaySubject<tDataResult>= new ReplaySubject<tDataResult>()
  persistBooking(book: Booking, type: tPersist): ReplaySubject<tDataResult>  {
    //we dont use booking.id in FE
    this.bookReplay.next({error: null})
    return this.bookReplay
  }

  private mailReplay : ReplaySubject<tDataResult>= new ReplaySubject<tDataResult>()
  persistMailing(mail: Mailing, type: tPersist): ReplaySubject<tDataResult> {
    //set a new id on insert
    if (type === tPersist.Insert) mail.id=this.getNextAvailableMailingId()
    this.mailReplay.next({error: null})
    return this.mailReplay
  }
  cleanupDataCache(){
    this.dataReplay = null
  }
}
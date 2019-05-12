import { Injectable } from '@angular/core';
import { Customer } from '../models/customer.model';
import { Booking } from '../models/booking.model';
import { CustomerBatch } from '../models/customerbatch.model';
import { Mailing } from '../models/mailing.model';
import { tBulkdataResult, tPersist, tDataResult } from './interfaces.persist';
import { take } from 'rxjs/operators';
import { UIService } from './ui.service';
import { ReplaySubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Globals } from '../shared/globals';
import { iData } from './interfaces.data';
import { PersistBase } from './persist.base.service';

import * as moment from 'moment';
import 'moment/locale/nl'  // without this line it didn't work
moment.locale('nl')

@Injectable({
  providedIn: 'root'
})

export class DataService implements iData{
  constructor(
    private _ps: PersistBase,
    private _ui: UIService,
   ) { 
      this.searchResult = new Array<Customer>();
  }

  private customers: Array<Customer>=[];
  private mailings: Array<Mailing>=[];
  public searchResult: Array<Customer>=[]; // temp, will come out of observable

  private dataReady$ = new ReplaySubject<tDataResult>()
  private searchCompleted$: ReplaySubject<Customer[]>= new ReplaySubject<Customer[]>()
  emailSearchTerm:string 

  getCustomer(id:number): Customer {
    return this.customers.find(x=>x.id === id)
  }

  getMailings():Mailing[]{
    return this.mailings.slice().sort((m1,m2)=>m2.sent-m1.sent)
  }
  
  getData(): void {
    let error: string
    if (this.customers.length === 0){
      this._ps.getData().pipe(take(1))  
      .subscribe((data: tBulkdataResult) => {
        this.customers = data.customers
        this.mailings = data.mailings
    
        //this._bs.cleanupDataCache()
        let err = data.error ? data.error : null
        let datareadyresult : tDataResult = {error:err}
        //emit next on data ready
        console.log("DataService: emitting dataReady.")
        this._ui.info('de data is beschikbaar' )
                
        setTimeout(x=> this.dataReady$.next(datareadyresult), Globals.computeDelay()) 
      })  
    }
  }

  // Replay Subjects always emit the last value on subscribe, but only when there is at least one
  dataReadyReplay(): ReplaySubject<tDataResult> {
       return this.dataReady$
  }
  // BehaviorSubjects start with initial value, subscribers will get get most recent value upon subscription
  searchResults(): ReplaySubject<Customer[]>{
       return this.searchCompleted$
  }

  searchCustomers(emailPiece:string, namePiece: string){
    this.emailSearchTerm= emailPiece
    this.dataReadyReplay().pipe(take(1))
      .subscribe(x =>{
        if (this.customers.length > 0){
          console.log('data ready, set the search result')
          let temp = this.customers.filter(x=>{
            return emailPiece && namePiece
            ? x.email.indexOf(emailPiece) > -1  && x.name.indexOf(namePiece) > -1
            : emailPiece ? x.email.indexOf(emailPiece) > -1
            : namePiece ? x.name.indexOf(namePiece) > -1
            : true
            })
          //copy it to update view automatically, only this no longer works with the dataReady observable
          this.searchResult.length=0 
          let count=0
          let maxsearch=10
          for (let x of temp){
              this.searchResult.push(x)
              count++
              if (count >= maxsearch) {
                this._ui.warning(`Er zijn meer matches dan het maximum ${maxsearch}, zoek specifieker.`)
                break;
              }
            }
          // console.log('this.searchResult.length === '+this.searchResult.length)
          this.searchCompleted$.next(this.searchResult)
        }
        else {
          this._ui.error('no data available, check the logs please (from settings).')
          this.searchCompleted$.next([])
        }
      })
  }

  private removeFromSearchResult(cust: Customer){
    let idx = this.searchResult.indexOf(cust)
    if (idx >=0) {
      this.searchResult.splice(idx, 1)
      this.searchCompleted$.next(this.searchResult)
    }
  }

  removeCustomerCascading(cust: Customer): ReplaySubject<tDataResult>{
    let result$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()

    this._ps.persistCustomer(cust, tPersist.Delete).pipe(take(1))
    .subscribe(result=>{
      if (!result.error) {
        //remove from searchresult as well
        this.removeFromSearchResult(cust)
        //remove object
        let idx = this.customers.indexOf(cust)
        if (idx >=0) this.customers.splice(idx, 1)
 
      }
      result$.next(result)
    })
    return result$
  }

  updateCustomer(id:number, custCopy:Customer): ReplaySubject<tDataResult> {
    //object is same everywhere, only update it in customers
    let result$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
    let realCust: Customer = this.customers.find(x=>x.id==custCopy.id)
    custCopy.id=realCust.id
      // persist the copy, if succes update the object
    this._ps.persistCustomer(custCopy, tPersist.Update).pipe(take(1)) 
            .subscribe((result)=>{
              if (!result.error) {
                realCust.consumeCustomerShallow(custCopy)
              }
              result$.next(result)
            })
    return  result$
  }
  
  addCustomer(newCust:Customer, navigateTo: string) : ReplaySubject<tDataResult>{
    // persist
    let result$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
   this._ps.persistCustomer(newCust, tPersist.Insert).pipe(take(1))
      .subscribe((result)=>{
          if (!result.error) {
            this.customers.push(newCust);
              //add to beginning of searchresult
              this.searchResult.unshift(newCust)
              this.searchCompleted$.next(this.searchResult)
          }
          result$.next(result)
      })
      return result$
    }

  addBooking(booking:Booking): ReplaySubject<tDataResult> {
    // persist
   let result$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
    this._ps.persistBooking(booking, tPersist.Insert).pipe(take(1))
    .subscribe((result) =>{
        if (!result.error) {
          let realCust = this.customers.find(x=>x.id==booking.custid);
          realCust.bookings.unshift(booking);
        }
        result$.next(result);
    })
    return result$;
  }

  removeBooking(booking:Booking) : ReplaySubject<tDataResult> {
    // persist
   let result$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>();
    this._ps.persistBooking(booking, tPersist.Delete).pipe(take(1))
    .subscribe((result) =>{
        if (!result.error) {
          let cust = this.customers.find(x=>x.id === booking.custid);
          let idx = cust.bookings.indexOf(booking);
          if (idx >=0) cust.bookings.splice(idx, 1);
        }
      result$.next(result);
    })
    return  result$;
  }

  addMailing(custList: number[]) : ReplaySubject<tDataResult>{
   let result$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>();
    let mail = new Mailing(-1, Date.now(), '', custList.slice());
    this._ps.persistMailing(mail, tPersist.Insert).pipe(take(1))
      .subscribe((dataResult)=>{
        if (!dataResult.error) {
          this.mailings.push(mail);
        }
        result$.next(dataResult);
      })
      return result$;
  }

  getLastMailing():Mailing {
    this.mailings.sort((m1,m2) =>{
      return m1.id-m2.id;
    })
    console.log(this.mailings);
    return this.mailings[this.mailings.length-1];
  }

  removeMailing(mail:Mailing) : ReplaySubject<tDataResult>{
    let result$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>();
    this._ps.persistMailing(mail, tPersist.Delete).pipe(take(1))
      .subscribe((dataResult)=>{
        if (!dataResult.error) {
          let idx = this.mailings.indexOf(mail);
          this.mailings.splice(idx,1);
        }
        result$.next(dataResult);
      })
      return result$;
  }

  clearCustomerSearch(){
    this.searchResult.length=0;
  }

  private bookingFallsWithinSlot(book: Booking, str_slot) : boolean {
    let arr_fromuntil = str_slot.split(',');
    let str_slot_from = arr_fromuntil[0];
    let str_slot_until= arr_fromuntil[1];

    let arr_slot_from = str_slot_from.split('/');
    let day_slot_from = Number(arr_slot_from[0]);
    let month_slot_from = Number(arr_slot_from[1]);
    
    let arr_slot_until = str_slot_until.split('/');
    let day_slot_until = Number(arr_slot_until[0]);
    let month_slot_until = Number(arr_slot_until[1]);

    let arrive_m = moment(book.arrive);
    let depart_m = moment(book.arrive);
    
    // regardless the year
    // compare months
    // if moth same, compare the day
    let arrive_within = arrive_m.month() > month_slot_from
                        ? true
                        : arrive_m.month() === month_slot_from
                        ? arrive_m.date() >= day_slot_from
                        : false;
    let depart_within = depart_m.month() < month_slot_until
                        ? true
                        : depart_m.month() === month_slot_until
                        ? depart_m.date() <= day_slot_until
                        : false;
    return arrive_within && depart_within;
  } 
  private matchBookings( bookings: Booking[],
                          str_slot: string,
                          msecNotVisitedFrom: number, msecNotVisitedUntil: number, 
                          allowedProptypes: string[], allowedBooktypes: string[]) {

      let typeAndSlotMatches = bookings.filter(
        (book) => {
          let typesMatch:boolean = allowedProptypes.includes(book.propcode) && allowedBooktypes.includes(book.booktype);
          let slotMatches:boolean = str_slot ? this.bookingFallsWithinSlot(book, str_slot): true;
          return slotMatches && typesMatch;
      }) //bookings.filter
      
      let result =false;
      let mostRecentBooking: Booking;
      
      // Check the arrival date on bookings of allowed types 
      if (typeAndSlotMatches.length > 0){
        // get the most recent one
        mostRecentBooking = typeAndSlotMatches.sort((a: Booking,b: Booking) => { return a.arrive- b.arrive })[0];
        //Now compare with not visitedSince & until
        let msec_ago = Date.now() - mostRecentBooking.arrive;
        result = msec_ago > msecNotVisitedFrom;
        if (result && msecNotVisitedUntil > 0) 
          result = msec_ago < msecNotVisitedUntil;
      }
    return result;
  }

  private getCustomers4Mailing (str_slot: string, 
                msecNotVisitedFrom: number, 
                msecNotVisitedUntil: number, 
                msecNotMailedFrom:number, 
                visitCount:number, 
                selectedProptypes: string[],
                selectedBooktypes: string[]):Customer[] {

    let result:Customer[]=[];
    if (this.customers){
      // start filtering customers
        let custHits =this.customers.filter(
          (cust: Customer) => {
            let filterResult = this.checkVisitCount(cust.bookings, visitCount);
            filterResult = filterResult && this.matchBookings(cust.bookings, str_slot,
                                    msecNotVisitedFrom, msecNotVisitedUntil, 
                                    selectedProptypes, selectedBooktypes);

            //Refine custHits by notMailedSince, if this is used
            if (msecNotMailedFrom > 0 && filterResult){
              filterResult = this.checkLastMailed(cust.id, msecNotMailedFrom);
            }
            return filterResult;
            }
          ) // customers.filter
        
        result = custHits;
      } //if (this.customers)
      return result;
  }

  checkLastMailed(custId: number, msecNotMailedFrom: number): boolean{
    let result=false
        //get mailings including this customer
        let mailings_thisCust = this.mailings.filter(m=>m.customerids.includes(custId))
        //narrow down on date sent
        if (mailings_thisCust.length > 0)
        {
            let mostRecentMail = mailings_thisCust.sort((m1,m2)=>m1.sent > m2.sent ? 1 : -1)[0];
            let mdiff = Date.now() - mostRecentMail.sent;
            result = mdiff >= msecNotMailedFrom;
        }
      return result
  }
  checkVisitCount(bookings: Booking[], visitCount: number) : boolean {
    // if visitCount is used, check it
    return visitCount < 0 || bookings.length >= visitCount;
  }

  searchEmails( str_slot: string, 
                monthsNotVisitedFrom: number, monthsNotVisitedUntil: number, 
                monthslastMailed:number, 
                totalVisits:number, 
                selectedProptypes: string[], selectedBooktypes: string[]
              ) : CustomerBatch[]{
    //convert everything to msec

    console.log('============= searchEmails =============')
    console.log(str_slot, 
                monthsNotVisitedFrom, monthsNotVisitedUntil, 
                monthslastMailed,  totalVisits, 
                selectedProptypes, selectedBooktypes);

    let msecNotVisitedFrom = monthsNotVisitedFrom   ?  Math.floor(monthsNotVisitedFrom * 1000 * 3600 * 24 * 30.5) : -1;
    let msecNotVisitedUntil = monthsNotVisitedUntil   ? Math.floor(monthsNotVisitedUntil * 1000 * 3600 * 24 * 30.5) : -1;
    let msecNotMailedFrom = monthslastMailed     ?  Math.floor(monthslastMailed * 1000 * 3600 * 24 * 30.5) : -1;
    let visitCount = totalVisits || -1;
    

    console.log(str_slot, 
                msecNotVisitedFrom, msecNotVisitedUntil, 
                msecNotMailedFrom, visitCount, 
                selectedProptypes, selectedBooktypes);
    let custHits:Customer[];
    custHits = this.getCustomers4Mailing(str_slot, 
                                  msecNotVisitedFrom, msecNotVisitedUntil, 
                                  msecNotMailedFrom, visitCount, 
                                  selectedProptypes, selectedBooktypes);
    
    let batchArr:CustomerBatch[]=[];

    let i=1;
    let batchsize=99;
    let batch : CustomerBatch = new CustomerBatch(batchsize);
    for (let c of custHits){
      if (!batch.hasSpace()){
        batchArr.push(batch);
        batch = new CustomerBatch(batchsize);// 100 = max size hotmail. todo make config setting
      }
      batch.add(c);
    } // for
    // add last open batch
    if (batch.hasItems()) batchArr.push(batch);

    return batchArr;
  }

 
}

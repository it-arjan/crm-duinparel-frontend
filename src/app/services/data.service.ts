import { Injectable } from '@angular/core';
import { Customer } from '../models/customer.model';
import { Booking } from '../models/booking.model';
import { EmailBatch } from '../models/emailbatch.model';
import { Globals } from '../shared/globals';
import { Mailing } from '../models/mailing.model';
import { BackendService } from './backend.service';
import { FakeBackendService } from './fake.data.backend.service';
import { tBulkdataResult, tPersist, tDataResult } from './interfaces.persist';
import { take } from 'rxjs/operators';
import { UIService } from './ui.service';
import { ReplaySubject, Subject, BehaviorSubject } from 'rxjs';
import { PersistService } from './persist.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(
    private _ps: PersistService,
    private _ui: UIService,
    private _router: Router 
   ) { 
      this.searchResult = new Array<Customer>();
      // this.searchResult.push(this.customers[0])
      // this.searchResult.push(this.customers[1])
    }

  private customers: Array<Customer>=[];
  private mailings: Array<Mailing>=[];
  public searchResult: Array<Customer>=[]; // temp, will come out of observable

  private dataReady$ = new ReplaySubject<tDataResult>()
  private persistReady$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
  searchCompleted$: BehaviorSubject<Customer[]>= new BehaviorSubject<Customer[]>([])
  emailSearchTerm:string 
  
  getData(): void {
    let error: string
    this._ps.getData().pipe(take(1))  
    .subscribe((data: tBulkdataResult) => {
      this.customers = data.customers
      this.mailings = data.mailings
      //this._bs.cleanupDataCache()
      let err = data.error?data.error: null
      let datareadyresult : tDataResult = {error:err}
      //emit next on data ready
      console.log("DataService: emitting dataReady")
      this.dataReadyReplay().next(datareadyresult)
    }) 
 
  }
  // Replays always emit the last value on subscribe, but only when there is one
  dataReadyReplay(): ReplaySubject<tDataResult> {
       return this.dataReady$
  }
  // BehaviorSubjects start with initial value, subscribers will get get most recent value upon subscription
  searchResults(): BehaviorSubject<Customer[]>{
       return this.searchCompleted$
  }
  searchCustomers(emailPiece:string){
    this.emailSearchTerm= emailPiece
    this.dataReadyReplay().pipe(take(1))
      .subscribe(x =>{
        if (this.customers.length > 0){
          console.log('data ready, set the search result')
          let temp = this.customers.filter(x=>x.email.indexOf(emailPiece) > -1)
          this.searchResult.length=0 //copy it to update view automatically, only this no longer works with the dataReady observable
          temp.forEach(x=>this.searchResult.push(x))
          // console.log('this.searchResult.length === '+this.searchResult.length)
          this.searchCompleted$.next(this.searchResult)
        }
        else {
          this._ui.error('no data available, check the logs please (from settings).')
          this.searchCompleted$.next([])
        }
      })
  }

  // getAllCustomers() : Array<Customer> {
  //     return this.customers.slice();
  // }
  
  getCustomer(id:number): Customer{
    return this.customers.find(x=>x.id === id)
  }
  
  removeCustomerCascading(cust: Customer): ReplaySubject<tDataResult>{

    this._ps.persistCustomer(cust, tPersist.Delete).pipe(take(1))
    .subscribe(result=>{
      if (!result.error) {
        //remove from searchresult as well
        let idx = this.searchResult.indexOf(cust)
        if (idx >=0) {
          this.searchResult.splice(idx, 1)
          this.searchCompleted$.next(this.searchResult)
        }
        
        idx = this.customers.indexOf(cust)
        if (idx >=0) this.customers.splice(idx, 1)
 
      }
      this.persistReady$.next(result)
    })
    return this.persistReady$
  }

  updateCustomer(id:number, custCopy:Customer): ReplaySubject<tDataResult> {
    //object is same everywhere, only update it in customers
    let realCust: Customer = this.customers.find(x=>x.id==custCopy.id)
    custCopy.id=realCust.id
      // persist the copy, if succes update the object
    this._ps.persistCustomer(custCopy, tPersist.Update).pipe(take(1))
            .subscribe((result)=>{
              if (!result.error) {
                realCust.consumeCustomerShallow(custCopy)
              }
              this.persistReady$.next(result)
            })
    return  this.persistReady$
  }
  
  addCustomer(newCust:Customer, navigateTo: string) : ReplaySubject<tDataResult>{
    // persist
    this._ps.persistCustomer(newCust, tPersist.Insert).pipe(take(1))
      .subscribe((result)=>{
          if (!result.error) {
            this.customers.push(newCust);
              //add to beginning of searchresult
              this.searchResult.unshift(newCust)
          }
          this.persistReady$.next(result)
      })
      return this.persistReady$
    }

  addBooking(booking:Booking): ReplaySubject<tDataResult> {
    // persist
    this._ps.persistBooking(booking, tPersist.Insert).pipe(take(1))
    .subscribe((result) =>{
        if (!result.error) {
          let realCust = this.customers.find(x=>x.id==booking.custid)
          realCust.bookings.unshift(booking)
        }
        this.persistReady$.next(result)
    })
    return this.persistReady$
  }

  removeBooking(booking:Booking) : ReplaySubject<tDataResult> {
    // persist
    this._ps.persistBooking(booking, tPersist.Delete).pipe(take(1))
    .subscribe((result) =>{
        if (!result.error) {
          let cust = this.customers.find(x=>x.id === booking.custid)
          let idx = cust.bookings.indexOf(booking)
          if (idx >=0) cust.bookings.splice(idx, 1)
        }
      this.persistReady$.next(result)
    })
    return  this.persistReady$
  }

  clearCustomerSearch(){
    this.searchResult.length=0;
  }

  selectMatchingBookings( cust: Customer, 
            monthsNotVisitedFrom: number, monthsNotVisitedUntil: number, 
            proptypesArg: string[], bookTypesArg: string[]) {
 
      let matchingBookings = cust.bookings.filter((book) => {
      let hasBooking = proptypesArg.includes(book.propcode) && bookTypesArg.includes(book.booktype)
      if (hasBooking){
        //Refine by calculate if cust has a booking older then  
        let diff = Date.now() - book.arrive 
        hasBooking = diff >= monthsNotVisitedFrom
        if (hasBooking && monthsNotVisitedUntil) 
          hasBooking = diff < monthsNotVisitedUntil
      }
      return hasBooking
    })
    return matchingBookings
  }

  searchEmails(monthsNotVisitedFrom: number, monthsNotVisitedUntil: number, 
              monthsNotMailedFrom:number, monthsNotMailedUntil:number, 
              proptypesArg: string[],
              bookTypesArg: string[]){
    //convert moths to msec
    let msecNotVisitedFrom = monthsNotVisitedFrom !== undefined ? Math.floor(monthsNotVisitedFrom * 1000 * 3600 * 24 * 30.5) : undefined
    let msecNotMailedUntil = monthsNotVisitedFrom !== undefined ? Math.floor(monthsNotMailedUntil * 1000 * 3600 * 24 * 30.5): undefined
    let msecNotMailedFrom = monthsNotVisitedFrom !== undefined ?  Math.floor(monthsNotMailedFrom * 1000 * 3600 * 24 * 30.5): undefined
    let msecNotMaileduntil =monthsNotVisitedFrom !== undefined ?  Math.floor(monthsNotMailedUntil * 1000 * 3600 * 24 * 30.5): undefined

    let batchArr:Array<EmailBatch>=[]
    if (this.customers){
      //simply filter customers
      let custHits1 =this.customers.filter((cust: Customer) => {
        // First see if this customer has bookings of this book-type and propcode
        // any booking will do, it can be too old for the criteria
        let matchingBookings = this.selectMatchingBookings(cust, msecNotVisitedFrom, msecNotMailedUntil, proptypesArg, bookTypesArg)
        return matchingBookings.length>0
      })
      
      //Refine by mailing criteria
      //Not optimal in performance but better for maintenance
      if (monthsNotMailedFrom){
        custHits1 =custHits1.filter((cust) => {
        let included=false
          //get mailings including this customer
          let mailings_thisCust = this.mailings.filter(m=>m.customerids.includes(cust.id))
          //narrow down on date sent
          if (mailings_thisCust.length > 0)
          {
              let mostRecentMail = mailings_thisCust.sort((m1,m2)=>m1.sent > m2.sent ? 1 : -1)[0]
              let mdiff = Date.now() - mostRecentMail.sent
              included = mdiff >= msecNotMailedFrom
              if (included && msecNotMaileduntil) {
                included = mdiff <= msecNotMaileduntil
              }
          }
        
        return included
      })
      }
      // console.log('-----------------')
      // console.log(proptypes)
      // console.log(bookTypes)
      // console.log(custHits)
      // console.log('-----------------')

      let i=1
      let batchsize=99
      let batch : EmailBatch = new EmailBatch(batchsize)
      for (let c of custHits1){
        if (i>batchsize){
          batchArr.push(batch)
          batch = new EmailBatch(batchsize)// 100 = max size hotmail. todo make config setting
          i=1
        }
        batch.add(c.email)
        i++
      }
      batchArr.push(batch)
    }
    return batchArr
  }

 
}

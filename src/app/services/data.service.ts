import { Injectable } from '@angular/core';
import { Customer } from '../models/customer.model';
import { Booking } from '../models/booking.model';
import { CustomerBatch } from '../models/customerbatch.model';
import { Mailing } from '../models/mailing.model';
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
    private _ps: FakeBackendService,
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
  private searchCompleted$: BehaviorSubject<Customer[]>= new BehaviorSubject<Customer[]>([])
  emailSearchTerm:string 

  getCustomer(id:number): Customer {
    return this.customers.find(x=>x.id === id)
  }

  getMailings():Mailing[]{
    return this.mailings.slice().sort((m1,m2)=>m2.sent-m1.sent)
  }
  
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
      this.dataReady$.next(datareadyresult)
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

  removeFromSearchResult(cust: Customer){
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
          let realCust = this.customers.find(x=>x.id==booking.custid)
          realCust.bookings.unshift(booking)
        }
        result$.next(result)
    })
    return result$
  }

  removeBooking(booking:Booking) : ReplaySubject<tDataResult> {
    // persist
   let result$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
    this._ps.persistBooking(booking, tPersist.Delete).pipe(take(1))
    .subscribe((result) =>{
        if (!result.error) {
          let cust = this.customers.find(x=>x.id === booking.custid)
          let idx = cust.bookings.indexOf(booking)
          if (idx >=0) cust.bookings.splice(idx, 1)
        }
      result$.next(result)
    })
    return  result$
  }

  addMailing(custList: number[]) : ReplaySubject<tDataResult>{
   let result$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
    let mail = new Mailing(-1, Date.now(), '', custList.slice())
    this._ps.persistMailing(mail, tPersist.Insert).pipe(take(1))
      .subscribe((dataResult)=>{
        if (!dataResult.error) {
          this.mailings.push(mail)
        }
        result$.next(dataResult)
      })
      return result$
  }
  getLastMailing():Mailing {
    this.mailings.sort((m1,m2) =>{
      return m1.id-m2.id
    })
    console.log(this.mailings)
    return this.mailings[this.mailings.length-1]
  }
  removeMailing(mail:Mailing) : ReplaySubject<tDataResult>{
    let result$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
    this._ps.persistMailing(mail, tPersist.Delete).pipe(take(1))
      .subscribe((dataResult)=>{
        if (!dataResult.error) {
          let idx = this.mailings.indexOf(mail)
          this.mailings.splice(idx,1)
        }
        result$.next(dataResult)
      })
      return result$
  }
  clearCustomerSearch(){
    this.searchResult.length=0;
  }

  bookingMatches(book: Booking,
            allowedProptypes: string[], 
            allowedBooktypes: string[],
            msecNotVisitedFrom: number, 
            msecNotVisitedUntil: number): boolean {

    //does property/bookType match?
    let hasMachingBookings = allowedProptypes.includes(book.propcode) && allowedBooktypes.includes(book.booktype)
    if (hasMachingBookings){
      //Refine by date  
      let diff_msec = Date.now() - book.arrive 
      hasMachingBookings = diff_msec > msecNotVisitedFrom
      if (hasMachingBookings && msecNotVisitedUntil > 0) 
        hasMachingBookings = diff_msec < msecNotVisitedUntil
    }
    return hasMachingBookings
  }

  selectMatchingBookings( cust: Customer, msecNotVisitedFrom: number, msecNotVisitedUntil: number, 
                          allowedProptypes: string[], allowedBooktypes: string[]) {
      let matchingBookings = cust.bookings.filter((book) => {
        return this.bookingMatches(book, allowedProptypes, allowedBooktypes, msecNotVisitedFrom, msecNotVisitedUntil)
      }) //cust.bookings.filter
    return matchingBookings 
  }
  findCustomers(msecNotVisitedFrom: number, 
                msecNotVisitedUntil: number, 
                msecNotMailedFrom:number, 
                visitCount:number, 
                selectedProptypes: string[],
                selectedBooktypes: string[]):Customer[] {
    let result:Customer[]=[]                
    if (this.customers){
      // simply filter customers
        let custHits =this.customers.filter((cust: Customer) => {
          // First see if this customer has bookings of this book-type and propcode
          // any booking will do, it can be too old for the criteria
          let hasVisitedEnough = visitCount < 0 || cust.bookings.length >= visitCount
          let matchingBookings = hasVisitedEnough  
                                ? this.selectMatchingBookings(cust, msecNotVisitedFrom, msecNotVisitedUntil, selectedProptypes, selectedBooktypes)
                                : []
          return matchingBookings.length > 0
        })
        
        //Refine by mailing criteria
        //Not optimal in performance but better for maintenance
        if (msecNotMailedFrom > 0){
          custHits =custHits.filter((cust) => {
          let included=false
            //get mailings including this customer
            let mailings_thisCust = this.mailings.filter(m=>m.customerids.includes(cust.id))
            //narrow down on date sent
            if (mailings_thisCust.length > 0)
            {
                let mostRecentMail = mailings_thisCust.sort((m1,m2)=>m1.sent > m2.sent ? 1 : -1)[0]
                let mdiff = Date.now() - mostRecentMail.sent
                included = mdiff >= msecNotMailedFrom
            }
          
          return included
        })
        } // if monthsNotMailedFrom
        result = custHits
      } //if (this.customers)
      return result
  }

  searchEmails(monthsNotVisitedFrom: number, monthsNotVisitedUntil: number, 
              monthsNotMailedFrom:number, totalVisits:number, 
              selectedProptypes: string[],
              selectedBooktypes: string[]) : CustomerBatch[]{
    //convert moths to msec
    let msecNotVisitedFrom = monthsNotVisitedFrom   ?  Math.floor(monthsNotVisitedFrom * 1000 * 3600 * 24 * 30.5) : -1
    let msecNotVisitedUntil = monthsNotVisitedUntil   ? Math.floor(totalVisits * 1000 * 3600 * 24 * 30.5) : -1
    let msecNotMailedFrom = monthsNotMailedFrom     ?  Math.floor(monthsNotMailedFrom * 1000 * 3600 * 24 * 30.5) : -1
    let visitCount = totalVisits || -1
    console.log(msecNotVisitedFrom, msecNotVisitedUntil, msecNotMailedFrom, visitCount)
    let custHits:Customer[]
    custHits = this.findCustomers(msecNotVisitedFrom, msecNotVisitedUntil, msecNotMailedFrom, visitCount, selectedProptypes, selectedBooktypes)

    
    let batchArr:CustomerBatch[]=[]

    let i=1
    let batchsize=99
    let batch : CustomerBatch = new CustomerBatch(batchsize)
    for (let c of custHits){
      if (!batch.hasSpace()){
        batchArr.push(batch)
        batch = new CustomerBatch(batchsize)// 100 = max size hotmail. todo make config setting
      }
      batch.add(c)
    } // for
    // add last open batch
    if (batch.hasItems()) batchArr.push(batch)

    return batchArr
  }

 
}

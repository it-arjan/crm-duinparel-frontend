import { Injectable } from '@angular/core';
import { Customer } from '../models/customer.model';
import { Booking } from '../models/booking.model';
import { EmailBatch } from '../models/emailbatch.model';
import { Globals } from '../shared/globals';
import { Mailing } from '../models/mailing.model';
import { BackendService } from './backend.service';
import { FakeBackendService } from './fake.data.backend.service';
import { tBulkdataResult, tPersist } from './interfaces.data';
import { take } from 'rxjs/operators';
import { UIService } from './ui.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(
    private _bs: BackendService,
    private _ui: UIService
    ) { 
    this.searchResult = new Array<Customer>();
    // this.searchResult.push(this.customers[0])
    // this.searchResult.push(this.customers[1])
    }

  private customers: Array<Customer>;
  private mailings: Array<Mailing>;

  public searchResult: Array<Customer>; // temp, will come out of observable

  getData() {
    let error: string
    this._bs.getData().pipe(take(1)).subscribe((data: tBulkdataResult) => {
      console.log("DataService: data received")
      if (data.error) this._ui.error(data.error)
      else{
        //convert objects to get acccess to the methods defined on this side
        this.customers = data.customers
        this.mailings = data.mailings
      }
      // Data no longer needed on the backend service
      this._bs.cleanupDataCache()
    }) //TODO emit data-ready on another Observable

  }
  
  searchCustomers(emailPiece:string){
    if (this.customers){
    let temp = this.customers.filter(x=>x.email.indexOf(emailPiece) > -1)
    this.searchResult.length=0
    temp.forEach(x=>this.searchResult.push(x))
    }
  }

  // getAllCustomers() : Array<Customer> {
  //     return this.customers.slice();
  // }
  
  getCustomer(id:number): Customer{
    return this.customers.find(x=>x.id === id)
  }
  
  removeCustomer(cust: Customer){
    let idx = this.customers.indexOf(cust)
    if (idx >=0) this.customers.splice(idx, 1)
    //remove from searchresult as well
    idx = this.searchResult.indexOf(cust)
    if (idx >=0) this.searchResult.splice(idx, 1)
  }

  updateCustomer(id:number, custCopy:Customer){
    //object is same everywhere, only update it in customers
    let realCust: Customer = this.customers.find(x=>x.id==custCopy.id)
    console.log('================')
    console.log(custCopy)
    console.log(realCust)
    console.log('================')
    realCust.test()
    realCust.consumeCustomerShallow(custCopy);
    // persist
    this._bs.persistCustomer(realCust, tPersist.Update)
  
  }
  
  addCustomer(newCust:Customer){
    this.customers.push(newCust);
    //add to beginning of searchresult
    this.searchResult.unshift(newCust)
    // persist
    return this._bs.persistCustomer(newCust, tPersist.Insert)
  }

  addBooking(booking:Booking){
    let realCust = this.customers.find(x=>x.id==booking.custid)
    realCust.bookings.unshift(booking)
    // persist
    this._bs.persistBooking(booking, tPersist.Insert)
  }

  removeBooking(booking:Booking){
    let cust = this.customers.find(x=>x.id === booking.custid)
    let idx = cust.bookings.indexOf(booking)
    if (idx >=0) cust.bookings.splice(idx, 1)
    // persist
    this._bs.persistBooking(booking, tPersist.Delete)
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

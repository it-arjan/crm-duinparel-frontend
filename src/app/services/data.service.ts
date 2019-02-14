import { Injectable } from '@angular/core';
import { Customer } from '../models/customer.model';
import { Booking } from '../models/booking.model';
import { EmailBatch } from '../models/emailbatch.model';
import { Globals } from '../shared/globals';
import { Mailing } from '../models/mailing.model';
import { BackendService } from './backend.service';
import { FakeBackendService } from './fake.data.backend.service';
import { tBulkdataResult, tPersist } from './data.service.interfaces';
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
     let subs = this._bs.getData().pipe(take(1)).subscribe((data: tBulkdataResult) => {
      console.log("DataService: data received")
      if (data.error) this._ui.error(data.error)
      this.customers=data.customers
      this.mailings=data.mailings
      })
  }
  
  searchCustomers(emailPiece:string){
    if (this.customers){
    let temp = this.customers.filter(x=>x.email.indexOf(emailPiece) > -1)
    this.searchResult.length=0
    temp.forEach(x=>this.searchResult.push(x))
    }
  }

  getAllCustomers() : Array<Customer> {
      return this.customers.slice();
  }
  
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

  addBooking(custId:number, booking:Booking){
    let realCust = this.customers.find(x=>x.id==custId)
    realCust.consumeBooking(booking);
    // persist
    this._bs.persistBooking(booking, tPersist.Insert)
  }

  removeBooking(custId:number, booking:Booking){
    let cust = this.customers.find(x=>x.id === custId)
    let idx = cust.bookings.indexOf(booking)
    if (idx >=0) cust.bookings.splice(idx, 1)
    // persist
    this._bs.persistBooking(booking, tPersist.Delete)
  }

  updateCustomer(id:number, cust:Customer){
    //object is same everywhere, only update it in customers
    let realCust = this.customers.find(x=>x.id==cust.id)
    realCust.consumeCustomer(cust);
    //todo: persist
    this._bs.persistCustomer(realCust, tPersist.Update)
  
  }
  
  addCustomer(cust:Customer){
    this.customers.push(cust);
    //add to beginning of searchresult
    this.searchResult.unshift(cust)
    //todo: persist
    return this._bs.persistCustomer(cust, tPersist.Insert)
  }

  clearCustomerSearch(){
    this.searchResult.length=0;
  }

  searchEmails(monthsNotVisitedFrom: number, monthsNotVisitedUntil: number, 
              monthsNotMailedFrom:number, monthsNotMailedUntil:number, 
              proptypesArg:Array<string>,
              bookTypesArg: Array<string>){
      
    let batchArr:Array<EmailBatch>=[]
    if (this.customers){
      let custHits =this.customers.filter((cust) => cust.bookings.filter(book => {
        let result = proptypesArg.includes(book.propcode) && bookTypesArg.includes(book.booktype)
        if (result){
          let diff = Globals.jsDateDiffMonths(book.arrive, new Date(Date.now()))
          //console.log('->', diff)
          result=diff >= monthsNotVisitedFrom
          if (result && monthsNotVisitedUntil) result = diff < monthsNotVisitedUntil
          if (result && monthsNotMailedFrom){
            //todo
          }
        }
        return result
      }).length>0
      )

      // console.log('-----------------')
      // console.log(proptypes)
      // console.log(bookTypes)
      // console.log(custHits)
      // console.log('-----------------')

      let i=1
      let batchsize=99
      let batch : EmailBatch = new EmailBatch(batchsize)
      for (let c of custHits){
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

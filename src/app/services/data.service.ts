import { Injectable } from '@angular/core';
import { DataPersistService } from './data-persist.service';
import { Customer } from '../models/customer.model';
import { Booking } from '../models/booking.model';
import { EmailBatch } from '../models/emailbatch.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private customers: Array<Customer>;
  public searchResult: Array<Customer>; // temp, will come out of observable
  constructor(private _dataPersist: DataPersistService) { 
    this.customers = this._dataPersist.GetAllCustomers();
    this.searchResult = new Array<Customer>();
    this.searchResult.push(this.customers[0])
    this.searchResult.push(this.customers[1])
    }

  searchCustomers(emailPiece:string){
    let temp = this.customers.filter(x=>x.email.indexOf(emailPiece) > -1)
    this.searchResult.length=0
    temp.forEach(x=>this.searchResult.push(x))
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
    //todo: persist
  }

  removeBooking(custId:number, booking:Booking){
    let cust = this.customers.find(x=>x.id === custId)
    let idx = cust.bookings.indexOf(booking)
    if (idx >=0) cust.bookings.splice(idx, 1)
    //todo: persist
  }

  updateCustomer(id:number, cust:Customer){
    //object is same everywhere, only update it in customers
    let realCust = this.customers.find(x=>x.id==cust.id)
    realCust.consumeCustomer(cust);
    //todo: persist
  
  }
  
  getNextAvailableId(): number{
    let maxId=0
    this.customers.forEach(x=> maxId = x.id > maxId ? x.id : maxId)
    return maxId + 1
  }

  addCustomer(cust:Customer){
    this.customers.push(cust);
    //add to beginning of searchresult
    this.searchResult.unshift(cust)
    //todo: persist
    cust.id = this.getNextAvailableId()
  }

  clearCustomerSearch(){
    this.searchResult.length=0;
  }
  
  selectMailing(monthsNotVisitedFrom: number, monthsNotVisitedUntil: number, 
              monthsNotMailedFrom:number, monthsNotMailedUntil:number, 
              proptypes:Array<string>,
              bookTypes: Array<string>){
      //customer of booktype
      let cust= this.customers[0]
      let custPropCode =cust.bookings.filter((book) =>
           cust.bookings.filter(book => proptypes.includes(book.propcode) && bookTypes.includes(book.booktype)).length>0
           )

    //   let custBooktype = this.customers.filter(cust => {
    //     let res =cust.bookings.filter((book) =>
    //        cust.bookings.filter(book => book.propcode===proptype))
    //   return res.length>0
    // })
    //bookTypes.includes(book.booktype) 
    console.log('-----------------')
    console.log(proptypes)
    console.log(bookTypes)
    console.log(custPropCode)
    console.log('-----------------')
        // cust.bookings.filter((book:Booking) =>{
        //   bookTypes.includes(book.booktype)
        // }).length > 0)
        //return hasTypeBookings
      //last booking  withint range
      //monthsNotVisitedfrom < now - book.arrive > monthsNotVisitedUntil
    let i=1
    let batchsize=5
    let result=[]
    let batch : EmailBatch = new EmailBatch(batchsize)
    // for (let c of custBooktype){
    //   if (i>batchsize){
    //     result.push(batch)
    //     batch = new EmailBatch(batchsize)// 100 = max size hotmail. todo make config setting
    //     i=1
    //   }
    //   batch.add(c.email)
    //   i++
    // }
    // result.push(batch)
    return result
  }
}

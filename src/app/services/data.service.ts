import { Injectable } from '@angular/core';
import { Customer } from '../models/customer.model';
import { Booking } from '../models/booking.model';
import { EmailBatch } from '../models/emailbatch.model';
import { Globals } from '../shared/globals';
import { Mailing } from '../models/mailing.model';
import { BackendService } from './backend.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private _bs: BackendService) { 
    this.searchResult = new Array<Customer>();
    // this.searchResult.push(this.customers[0])
    // this.searchResult.push(this.customers[1])
    }

  private customers: Array<Customer>;
  private mailings: Array<Mailing>;

  public searchResult: Array<Customer>; // temp, will come out of observable

  getData() {
     this._bs.getAllData().then((data) => {
      console.log("DataService: data recieved")
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

  GetHardcodedData(): Array<Customer>{
    let result: Array<Customer>= new Array<Customer>();
    let bookings = new Array<Booking>();
    bookings.push(new Booking( 1, 1, new Date("03/25/2015"), new Date("03/28/2015"),'jvg', 'week'))
    bookings.push(new Booking( 2, 1, new Date("04/25/2014"), new Date("04/28/2014"),'jvg', 'week'))
    result.push(new Customer(1,'jan jansen','bloemstraat 13, 1232 AJ, rotterdam', 'jjanse@hotmail.com','0034ngb1246345923', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 3, 2, new Date("03/25/2018"), new Date("03/28/2018"),'jvg', 'weekend'))
    bookings.push(new Booking( 4, 2, new Date("04/25/2018"), new Date("04/28/2018"),'alb', 'weekend'))
    bookings.push(new Booking( 5, 2, new Date("08/25/2018"), new Date("08/28/2018"),'jvg', 'weekend'))
    bookings.push(new Booking( 6, 2, new Date("11/25/2018"), new Date("11/28/2018"),'jvg', 'weekend'))
    result.push(new Customer(2,'jan doedel','dopperstraat 13, 1232 AJ, tsjietjerkstadeel', 'j.d@xs4all.nl','', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 7, 3, new Date("03/25/2015"), new Date("03/28/2015"),'alb', 'week'))
    bookings.push(new Booking( 8, 3, new Date("05/15/2014"), new Date("05/22/2014"),'jvg', 'week'))
    result.push(new Customer(3,'bert pietersen','jan steenstraat 13, 1000 TA, amsterdam', 'bepie@outlook.com','0031ingb0475860', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 9, 4, new Date("03/25/2015"), new Date("03/28/2015"),'app', 'midweek'))
    bookings.push(new Booking( 10, 4, new Date("03/25/2014"), new Date("03/28/2014"),'app', 'midweek'))
    result.push(new Customer(4,'karel van appman','hoofdweg 33, 1013 XA, harlingen', 'kbeene.appmens@xs4all.nl','0031ingb017482225', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 11, 5, new Date("03/25/2017"), new Date("03/28/2017"),'app', 'midweek'))
    bookings.push(new Booking( 12, 5, new Date("03/25/2018"), new Date("03/28/2018"),'app', 'midweek'))
    result.push(new Customer(5,'M dawohl','hptwg 33, 10134, colon', 'd.wohl.appmens@grundlich.de','', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 13, 6, new Date("09/24/2017"), new Date("09/28/2017"),'app', 'midweek'))
    bookings.push(new Booking( 14, 6, new Date("08/18/2018"), new Date("08/14/2018"),'app', 'midweek'))
    result.push(new Customer(6,'K debringer','mittelweg 34, 10123, hamburg', 'k.debringer.appmens@gmx.de','', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 15, 7, new Date("06/23/2017"), new Date("06/29/2017"),'alb', 'midweek'))
    bookings.push(new Booking( 16, 7, new Date("06/23/2018"), new Date("06/29/2018"),'jvg', 'midweek'))
    result.push(new Customer(7,'JJ aka','main st 33, 10134, london', 'aka.jj@heaven.co.uk','', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 17, 8, new Date("04/23/2017"), new Date("04/29/2017"),'alb', 'midweek'))
    bookings.push(new Booking( 18, 8, new Date("08/14/2018"), new Date("08/21/2018"),'jvg', 'week'))
    result.push(new Customer(8,'ms Smith','22nd st 33374, 1013423, NYC', 'smith-wesson@nra.com','', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking( 19, 9, new Date("04/23/2017"), new Date("04/29/2017"),'alb', 'midweek'))
    bookings.push(new Booking( 20, 9, new Date("06/14/2018"), new Date("06/21/2018"),'jvg', 'week'))
    result.push(new Customer(9,'ms Jones','23rd st 23532, 101312323, NYC', 'jonejone@usa.today','', bookings))

    return result;
  }
}

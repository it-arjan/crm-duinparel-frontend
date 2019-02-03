import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Booking } from '../models/booking.model';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class DataPersistService {

  constructor(private _electronService: ElectronService) { }
  checkPlatform(){
    if(!this._electronService.isElectronApp) {
      throw new Error('NodeJs cann only be approached in electron app.')
    }
  }

  GetAllCustomers(): Array<Customer>{
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

  StoreBooking(booking:Booking){
    //platform check
    this.checkPlatform();
    //subscribe first
    this._electronService.ipcRenderer.once('StoreBookingResponse', (event: Electron.IpcMessageEvent, arg: Booking) => {
        console.log('StoreBookingResponse!!');
        console.log(arg)

    });
    //then send data to ipcMain
    this._electronService.ipcRenderer.send('StoreBooking', booking)
  }
  
  StoreCustomer(cust: Customer){

  }
  RemoveCustomer(cust: Customer){

  }
  AddBooking(booking:Booking){

  }
  RemoveBooking(booking:Booking){

  }
}

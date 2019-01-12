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
    bookings.push(new Booking(false, 1, 1, new Date("03/25/2015"), new Date("03/28/2015"),'jvg'))
    bookings.push(new Booking(false, 2, 1, new Date("03/25/2014"), new Date("03/28/2014"),'jvg'))
    result.push(new Customer(1,'jan jansen','bloemstraat 13, 1232 AJ, rotterdam', 'jjanse@hotmail.com','0034ngb1246345923', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking(false, 3, 2, new Date("03/25/2015"), new Date("03/28/2015"),'alb'))
    bookings.push(new Booking(false, 4, 2, new Date("05/15/2014"), new Date("05/22/2014"),'alb'))
    result.push(new Customer(2,'bert pietersen','jan steenstraat 13, 1000 TA, amsterdam', 'bepie@outlook.com','0031ingb0475860', bookings))

    bookings = new Array<Booking>();
    bookings.push(new Booking(false, 5, 3, new Date("03/25/2015"), new Date("03/28/2015"),'app'))
    bookings.push(new Booking(false, 6, 3, new Date("03/25/2014"), new Date("03/28/2014"),'app'))
    result.push(new Customer(3,'karel van beene','hoofdweg 33, 1013 XA, harlingen', 'kbeene@xs4all.nl','0031ingb017482225', bookings))

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
  GetBooking(booking:Booking){

  }
  RemoveBooking(booking:Booking){

  }
  StoreCustomer(cust: Customer){

  }
  GetCustomer(cust: Customer){

  }
  RemoveCustomer(cust: Customer){

  }

}

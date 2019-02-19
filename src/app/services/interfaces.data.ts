import { Injectable } from '@angular/core';
import { Customer, jsCustomer } from '../models/customer.model';
import { Mailing, jsMailing } from '../models/mailing.model';
import { Booking } from '../models/booking.model';
import { Observable, ReplaySubject } from 'rxjs';

// export interface tBulkdataResult {
//   customers: {name:string,address:string,email:string,country:string,}[]
//   mailings: {}[]
//   error: string
// }
export interface tBulkdataResult {
  customers: Customer[] 
  mailings: Mailing[] 
  error: string
}
export interface tBulkdataResultNodejs {
  jscustomers: jsCustomer[] 
  jsmailings: jsMailing[] 
  error: string
}
export interface tDataResult {
  error: string
}
export interface tDataResultNodejs {
  generatedid: number
  error: string
}
export interface tPersistBag {
  objecttype: string 
  object: Customer | Booking | Mailing
  persisttype: string
}

export enum tPersist {Insert, Update, Delete}

export interface iDataService {
   getData(): ReplaySubject<tBulkdataResult>
   persistCustomer(cust: Customer, type: tPersist): ReplaySubject<tDataResult>
   persistBooking(book: Booking, type: tPersist): ReplaySubject<tDataResult>
   persistMailing(mail: Mailing, type: tPersist): ReplaySubject<tDataResult>
   cleanupDataCache()
}
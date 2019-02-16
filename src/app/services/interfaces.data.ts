import { Injectable } from '@angular/core';
import { Customer } from '../models/customer.model';
import { Mailing } from '../models/mailing.model';
import { Booking } from '../models/booking.model';
import { Observable, ReplaySubject } from 'rxjs';

export interface tBulkdataResult {
  customers: Customer[]
  mailings: Mailing[]
  error: string
}
export interface tDataResult {
  error: string
}
export interface tDataResultBackend {
  generatedId: number
  error: string
}
export interface tPersistCustomer {
  customer: Customer
  persistType: string
}
export interface tPersistbooking {
  booking: Booking
  persistType: string
}
export interface tPersistMailing {
  mailing: Mailing
  persistType: string
}
export enum tPersist {Insert, Update, Delete}

export interface iDataService {
   getDataFromBackend(): ReplaySubject<tBulkdataResult>
   persistCustomer(cust: Customer, type: tPersist): ReplaySubject<tDataResult>
   persistBooking(book: Booking, type: tPersist): ReplaySubject<tDataResult>
   persistMailing(mail: Mailing, type: tPersist): ReplaySubject<tDataResult>
   cleanupDataCache()
}
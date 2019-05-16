import { ReplaySubject, BehaviorSubject } from 'rxjs';
import { tDataResult } from './interfaces.persist';
import { Customer } from '../../models/customer.model';
import { Booking } from '../../models/booking.model';
import { Mailing } from '../../models/mailing.model';
import { CustomerBatch } from '../../models/customerbatch.model';

export interface iData{
    getData(): void
    dataReadyReplay(): ReplaySubject<tDataResult>
    searchResults(): ReplaySubject <Customer[]>
    
    searchCustomers(emailPiece:string, namePiece: string): void
    clearCustomerSearch(): void
    getCustomer(id:number): Customer
    
    removeCustomerCascading(cust: Customer): ReplaySubject<tDataResult>
    updateCustomer(id:number, custCopy:Customer): ReplaySubject<tDataResult>
    addCustomer(newCust:Customer, navigateTo: string) : ReplaySubject<tDataResult>
    addBooking(booking:Booking): ReplaySubject<tDataResult>
    removeBooking(booking:Booking) : ReplaySubject<tDataResult>
    addMailing(custList: number[]) : ReplaySubject<tDataResult>
    getLastMailing():Mailing 
    removeMailing(mail:Mailing) : ReplaySubject<tDataResult>
    searchEmails( str_slot: string, 
                monthsNotVisitedFrom: number, monthsNotVisitedUntil: number, 
                monthsNotMailedFrom:number, totalVisits:number, 
                selectedProptypes: string[],
                selectedBooktypes: string[]) : CustomerBatch[]
}
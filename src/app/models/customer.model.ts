import { Booking } from './booking.model';

export class Customer {
    constructor(
        public id:number, 
        public name: string, 
        public address:string, 
        public email:string, 
        public iban:string,
        public bookings: Array<Booking>){
    }
    consumeCustomer(cust :Customer){
        this.id=cust.id
        this.name=cust.name
        this.address=cust.address
        this.email=cust.email
        this.iban=cust.iban
    }
    consumeBooking(booking:Booking){
        this.bookings.push(booking)
    }
}
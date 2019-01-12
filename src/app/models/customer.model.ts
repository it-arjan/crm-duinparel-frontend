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
    consume(cust :Customer){
        this.id=cust.id
        this.name=cust.name
        this.address=cust.address
        this.email=cust.email
        this.iban=cust.iban
        this.bookings=cust.bookings.slice()
    }
}
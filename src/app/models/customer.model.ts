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
    consumeCustomerDeep(cust :Customer){
        this.consumeCustomer(cust)
        this.bookings=[]
        console.log('consumeCustomerDeep')
        console.log(cust.bookings)
        cust.bookings.map(x=>this.bookings.push(new Booking(x.id,x.custid,new Date(x.arrive), new Date(x.depart),x.propcode,x.booktype) ))
        console.log(this.bookings)
    }
    consumeBooking(booking:Booking){
        this.bookings.unshift(booking)
    }
    consumeBookingClone(b:Booking){
        this.bookings.unshift(new Booking(b.id,b.custid,b.arrive,b.depart,b.propcode, b.booktype))
    }
    test(){
        console.log('test succeeded')
    }
}
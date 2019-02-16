import { Booking } from './booking.model';
export class jsCustomer {
      constructor(
        public id:number, 
        public name: string, 
        public address:string, 
        public email:string, 
        public iban:string,
        public bookings: Array<Booking>){
    }
}
export class Customer {
    constructor(
        public id:number, 
        public name: string, 
        public address:string, 
        public email:string, 
        public iban:string,
        public bookings: Array<Booking>){
    }

    consumeCustomerShallow(cust :Customer){
        this.id=cust.id
        this.name=cust.name
        this.address=cust.address
        this.email=cust.email
        this.iban=cust.iban
    }
    static consumejsCustomerDeep(toClone :jsCustomer):Customer{
      let clone = new Customer(1, '','','','',[])
        clone.id=toClone.id
        clone.name=toClone.name
        clone.address=toClone.address
        clone.email=toClone.email
        clone.iban=toClone.iban
        clone.bookings=[]
        if (toClone.bookings)
          toClone.bookings.map(x=>clone.bookings.push(new Booking(x.id,x.custid,x.arrive, x.depart,x.propcode,x.booktype) ))
        // todo else ??
        return clone
    }
    test(){
        console.log('test succeeded')
    }
}

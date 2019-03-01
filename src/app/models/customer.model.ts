import { Booking } from './booking.model';
export class jsCustomer {
      constructor(
        public id:number, 
        public name: string, 
        public address:string, 
        public email:string, 
        public phone:string, 
        public country:string,
        public bookings: Array<Booking>){
    }
}
export class Customer {
    constructor(
        public id:number, 
        public name: string, 
        public address:string, 
        public email:string, 
        public phone:string, 
        public country:string,
        public bookings: Array<Booking>){}

    consumeCustomerShallow(cust :Customer){
        this.id=cust.id
        this.name=cust.name
        this.address=cust.address
        this.email=cust.email
        this.phone=cust.phone
        this.country=cust.country
    }
    static consumejsCustomerDeep(toClone :jsCustomer):Customer{
      let clone = new Customer(1, '','','','','',[])
        clone.id=toClone.id
        clone.name=toClone.name
        clone.address=toClone.address
        clone.email=toClone.email
        clone.phone=toClone.phone
        clone.country=toClone.country
        clone.bookings=[]
        if (toClone.bookings){
          toClone.bookings.sort((b1,b2)=>{return b2.arrive-b1.arrive})
          toClone.bookings.map(x=>clone.bookings.push(new Booking(x.id,x.custid,x.arrive, x.depart, x.nrpers,x.propcode,x.booktype) ))
        }
        // todo else ??
        return clone
    }
    test(){
        console.log('test succeeded')
    }
}

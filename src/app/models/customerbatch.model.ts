import { Customer } from './customer.model';

export class CustomerBatch {
    constructor(max:number){
        this._maxSize=max
        this.custList = []
    }
    private _maxSize:number=95 
    custList: Customer[]

    hasItems(): boolean {
      return this.custList.length > 0
    }
    getEmailCsv(){
      let csv =''
      for (let cust of this.custList){
        csv = csv + cust.email  + ','
      }
      //remove last ,
      if (csv.length > 0) csv = csv.slice(0, -1)

      return csv
    }
    hasSpace(): boolean {
      return this.custList && this.custList.length < this._maxSize
    }

    add(cust:Customer) : boolean{
        if (this.hasSpace()) this.custList.push(cust)
        return this.hasSpace()
    }
}
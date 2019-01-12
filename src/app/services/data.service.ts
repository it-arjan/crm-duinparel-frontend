import { Injectable } from '@angular/core';
import { DataPersistService } from './data-persist.service';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private customers: Array<Customer>;
  public searchResult: Array<Customer>; // temp, will come out of observable
  constructor(private _dataPersist: DataPersistService) { 
    this.customers = this._dataPersist.GetAllCustomers();
    this.searchResult = new Array<Customer>();
    this.searchResult.push(this.customers[0])
    this.searchResult.push(this.customers[1])
    }
  searchCustomers(emailPiece:string){
    let temp = this.customers.filter(x=>x.email.startsWith(emailPiece))
    this.searchResult.length=0
    temp.forEach(x=>this.searchResult.push(x))
  }
  getCustomers() : Array<Customer> {
      return this.customers.slice();
  }
  
  getCustomer(id:number): Customer{
    return this.customers.find(x=>x.id === id)
  }
  
  removeCustomer(cust: Customer){
    let idx = this.customers.indexOf(cust)
    if (idx >=0) this.customers.splice(idx, 1)
    //this.customers = this.customers.filter(x=>x.id != cust.id)
    let temp = this.searchResult.filter(x=>x.id != cust.id)
    idx = this.searchResult.indexOf(cust)
    if (idx >=0) this.searchResult.splice(idx, 1)
  }
  
  updateCustomer(id:number, cust:Customer){
    //object is same everywhere, only update it in customers
    let realCust = this.customers.find(x=>x.id==cust.id)
    realCust.consume(cust);
    //todo: persist
  
  }
  getNextAvailableId(): number{
    let maxId=0
    this.customers.forEach(x=> maxId = x.id > maxId ? x.id : maxId)
    return maxId + 1
  }
  addCustomer(cust:Customer){
    this.customers.push(cust);
    //add to beginning of searchresult
    this.searchResult.unshift(cust)
    //todo: persist
    cust.id = this.getNextAvailableId()
  }

  clearSearchResult(){
    this.searchResult.length=0;
  }
SaveAll(){

}

}

import { Component, OnInit } from '@angular/core';
import { Customer } from 'src/app/models/customer.model';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  customers : Array<Customer>
  selectedIdx:number
  constructor(private _router: Router, private _dataService: DataService) { }

  ngOnInit() {
    this.customers = this._dataService.searchResult
  }
  onClick(idx:number, action:string){
    this.selectedIdx=idx;
    if (action==='book') this._router.navigate(['booking','cust',this.customers[this.selectedIdx].id, 'bookings'])
    else this._router.navigate(['booking','cust',this.customers[this.selectedIdx].id])
  }
  onDblclick(idx: number){
    this._dataService.searchCustomers(this.customers[idx].email)
  }
}

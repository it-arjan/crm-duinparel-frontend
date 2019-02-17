import { Component, OnInit } from '@angular/core';
import { Customer } from 'src/app/models/customer.model';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { UIService } from 'src/app/services/ui.service';
import { tGuistate } from 'src/app/services/interfaces.ui';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  customers : Array<Customer>
  selectedIdx:number
  constructor(private _router: Router, private _ds: DataService, private _ui: UIService) { }

  ngOnInit() {
    this.customers = this._ds.searchResult
  }
  onClick(idx:number, action:string){
    this.selectedIdx=idx;
    

    if (action==='book') {
      this._router.navigate(['booking','cust',this.customers[this.selectedIdx].id, 'bookings'])
      this._ui.notify(tGuistate.editCustomer)
    }
    else {
      this._router.navigate(['booking','cust',this.customers[this.selectedIdx].id])
      this._ui.notify(tGuistate.bookingsOfCustomer)
    }
  }
  onDblclick(idx: number){
    this._ds.searchCustomers(this.customers[idx].email)
  }
}

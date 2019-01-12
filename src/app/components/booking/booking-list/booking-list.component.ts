import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Customer } from 'src/app/models/customer.model';

@Component({
  selector: 'app-booking-list',
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.css']
})
export class BookingListComponent implements OnInit {

  constructor(
    private _dataService: DataService, 
    private _router: Router, 
    private _activatedRoute: ActivatedRoute) { }
    custId: number;
    customer: Customer;
  ngOnInit() {
    this._activatedRoute.params.subscribe( //subscription is cleanedup automatically in this case
      (params: Params) => {
        console.log(params)
          console.log('editMode')
          this.custId = +params['custid'];
          this.customer = this._dataService.getCustomer(this.custId);  
         });
      }

      
}

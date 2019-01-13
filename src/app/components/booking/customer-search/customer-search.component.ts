import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-customer-search',
  templateUrl: './customer-search.component.html',
  styleUrls: ['./customer-search.component.css']
})
export class CustomerSearchComponent implements OnInit {

  constructor(private _router: Router, private _ds: DataService) { }
  reactiveForm: FormGroup;
  ngOnInit() {
    this.initForm()
  }
  initForm(){
    this.reactiveForm = new FormGroup({
      'email': new FormControl('')//, Validators.required
    })
  }
  onSubmit(){
    this._ds.searchCustomers(this.reactiveForm.get('email').value)
  }
onNewCustomer(){
  this._ds.clearSearchResult();
  this._router.navigate(['booking','cust','new'])
}
}

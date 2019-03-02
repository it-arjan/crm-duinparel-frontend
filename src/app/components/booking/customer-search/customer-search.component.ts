import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UIService } from 'src/app/services/ui.service';
import { tGuistate } from 'src/app/services/interfaces.ui';

@Component({
  selector: 'app-customer-search',
  templateUrl: './customer-search.component.html',
  styleUrls: ['./customer-search.component.css']
})
export class CustomerSearchComponent implements OnInit {

  constructor(private _router: Router, private _ds: DataService, private _ui: UIService) { }
  reactiveForm: FormGroup;
  ngOnInit() {
    this.initForm()
    this._ds.getData() //emits on dataReady() when done

  }
  initForm(){
    this.reactiveForm = new FormGroup({
      'email': new FormControl(''),//, Validators.required
      'name': new FormControl('')//, Validators.required
    })
  }
  onSubmit(){
    this._ui.checkin(tGuistate.searchCustomer)
    this._ds.searchCustomers(this.reactiveForm.get('email').value, this.reactiveForm.get('name').value)
  }
  onNewCustomer(){
    this._ui.checkin(tGuistate.newCustomer)
    //this._ds.clearCustomerSearch();
    this._router.navigate(['booking','cust','new'])
  }
}

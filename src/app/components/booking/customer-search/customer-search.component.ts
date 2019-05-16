import { Component, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UIService } from 'src/app/services/ui.service';
import { tGuistate, tGuiguidance, tComponentNames } from 'src/app/services/interfaces/interfaces.ui';
import { UIGuidanceService } from 'src/app/services/ui.guidance.service';

@Component({
  selector: 'app-customer-search',
  templateUrl: './customer-search.component.html',
  styles: [`
  :host { /* see if this affects the position: absolute behavior */
      display: block;
      }
  `]
})
export class CustomerSearchComponent implements OnInit {

  constructor(
    private _router: Router, 
    private _ds: DataService,
    private _guidance: UIGuidanceService, 
    private _ui: UIService) 
  {
   }

  reactiveForm: FormGroup;
  
  @ViewChild("customer_search_outer") outerRef: ElementRef
  @ViewChild("customer_search_cover") coverRef: ElementRef

  ngOnInit() {
    this.initForm()
    this._ui.guider()//.pipe(take(1)) 
      .subscribe((guidance: tGuiguidance)=>{
        this._guidance.handleGuidance(tComponentNames.searchCustomer, this.outerRef, this.coverRef, guidance)
        })
  }
  initForm(){
    this.reactiveForm = new FormGroup({
      'email': new FormControl(''),//, Validators.required
      'name': new FormControl('')//, Validators.required
    })
  }
  onSubmit(){
    this._ui.checkin(tGuistate.searchCustomerClick)
    this._ds.searchCustomers(this.reactiveForm.get('email').value, this.reactiveForm.get('name').value)
  }
  onNewCustomer(){
    this._ui.checkin(tGuistate.newCustomerOpen)
    //this._ds.clearCustomerSearch();
    this._router.navigate(['booking','cust','new'])
  }
}

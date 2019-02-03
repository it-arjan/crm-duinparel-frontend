import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { Customer } from 'src/app/models/customer.model';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { UIService } from 'src/app/services/ui.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '../../ng-bootstrap/modal-confirm/modal-confirm.component';

@Component({
  selector: 'app-customer-new-edit',
  templateUrl: './customer-new-edit.component.html',
  styleUrls: ['./customer-new-edit.component.css']
})
export class CustomerNewEditComponent implements OnInit {

  constructor(
    private _dataService: DataService, 
    private _router: Router, 
    private _activatedRoute: ActivatedRoute,
    private _ui : UIService,
    private _modalService: NgbModal,
    ) { }

  reactiveForm: FormGroup;
  editMode:boolean;
  custId:number;
  customer: Customer;
  
  ngOnInit() {
    this._activatedRoute.params.subscribe( //subscription is cleanedup automatically in this case
      (params: Params) => {
        this.editMode = params['custid'] != null;
        if (this.editMode){
          //console.log('editMode')
          this.custId = +params['custid'];
          this.customer = this._dataService.getCustomer(this.custId);  
        } else{
          this.custId=-1
        }
        this.initForm()
      }
    )
  }

  private initForm(){
    let name='', address='', email='', iban='';
    if (this.editMode){
      name=this.customer.name
      address = this.customer.address
      email = this.customer.email
      iban = this.customer.iban  
   }

   this.reactiveForm = new FormGroup({
    'name': new FormControl(name, Validators.required),
    'address': new FormControl(address, Validators.required), 
    'email': new FormControl(email, [Validators.required, Validators.email]), 
    'iban': new FormControl(iban), 
  })
  }

  onSubmit(){
    try{
      let editedCustomer = new Customer(this.custId,
        this.reactiveForm.get('name').value, 
        this.reactiveForm.get('address').value, 
        this.reactiveForm.get('email').value,
        this.reactiveForm.get('iban').value,
        []
        )

      if (this.editMode) {
        editedCustomer.bookings=this.customer.bookings
        this._dataService.updateCustomer(this.custId, editedCustomer)
      }
      else {
        this._dataService.addCustomer(editedCustomer)
      }
      this._ui.success()
      this._router.navigate(['/booking'])
      }
      catch (ex){
        this._ui.error('Opslaan mislukt')
      }
  }

  onCancel(){
    this._ui.cancelled()
    this._router.navigate(['/booking'])
  }

  onDelete () {
    const modalRef = this._modalService.open(ModalConfirmComponent);
    modalRef.componentInstance.title = 'Klant verwijderen';
    modalRef.componentInstance.message = 'Verwijder klant';
    modalRef.componentInstance.messageHighlighted = this.customer.name;
    modalRef.result
    .then(()=>{
      try {
        //throw new Error('testen van errors!')
        this._dataService.removeCustomer(this.customer);
        this._ui.broadCastRemoval()
        this._router.navigate(['/booking'])
      }
      catch (err){
        this._ui.error('verwijderen mislukt: ' + err)
        console.log(err)
      }
    })
    .catch(()=>{
      console.log('modal cancelled')

    })
  }
}

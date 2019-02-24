import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { Customer } from 'src/app/models/customer.model';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { UIService } from 'src/app/services/ui.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '../../ng-bootstrap/modal-confirm/modal-confirm.component';
import { take } from 'rxjs/operators';
import { tGuistate, tGuiguidance, tComponentNames } from 'src/app/services/interfaces.ui';
import { TData } from '@angular/core/src/render3/interfaces/view';
import { tDataResult } from 'src/app/services/interfaces.persist';

@Component({
  selector: 'app-customer-new-edit',
  templateUrl: './customer-new-edit.component.html',
  styleUrls: ['./customer-new-edit.component.css']
})
export class CustomerNewEditComponent implements OnInit {

  constructor(
    private _ds: DataService, 
    private _router: Router, 
    private _activatedRoute: ActivatedRoute,
    private _ui : UIService,
    private ngZone: NgZone,
    private _modalService: NgbModal,
    ) { }
  name: tComponentNames.newEditCustomer
  reactiveForm: FormGroup;
  editMode:boolean;
  custId:number;
  customer: Customer;
  dataAvailable=false
  ngOnInit() {
    //this.initForm()
    this._activatedRoute.params.subscribe( //subscription is cleanedup automatically in this case
      (params: Params) => {
        this.editMode = params['custid'] != null;
        if (this.editMode){
          //console.log('editMode')
          this.custId = +params['custid'];
          this._ds.dataReadyReplay().pipe(take(1))
          .subscribe(()=>{
              this.customer = this._ds.getCustomer(this.custId)
              this.initForm()
              this.dataAvailable=true
          })
        } else{
          this.initForm()
          this.dataAvailable=true
          this.custId=-1
        }
      })
  }

  private initForm(){
    let name='', address='', email='', country='';
    if (this.editMode){
      name=this.customer.name
      address = this.customer.address
      email = this.customer.email
      country = this.customer.country  
   }

   this.reactiveForm = new FormGroup({
    'name': new FormControl(name, Validators.required),
    'address': new FormControl(address, Validators.required), 
    'email': new FormControl(email, [Validators.required, Validators.email]), 
    'country': new FormControl(country), 
  })
  }

  onSubmit(){
    try{
      let editedCustomer = new Customer(this.custId,
        this.reactiveForm.get('name').value, 
        this.reactiveForm.get('address').value, 
        this.reactiveForm.get('email').value,
        this.reactiveForm.get('country').value,
        []
        )

      if (this.editMode) {
        editedCustomer.bookings=this.customer.bookings
        this._ds.updateCustomer(this.custId, editedCustomer).pipe(take(1))
          .subscribe((result)=>{
               this.handlePersistResponse(result)
            })

      }
      else {
        console.log('before: ' + editedCustomer.id)
        this._ds.addCustomer(editedCustomer, '/booking').pipe(take(1))
         .subscribe((result: tDataResult)=>{
           console.log('Cust comp: Receiving addCustomer response')
              this.handlePersistResponse(result)
          })
        }
      }
      catch (ex){
        this._ui.error('Opslaan mislukttt ' + ex)
      }
  }

  handlePersistResponse(result: tDataResult, remove?:string){
    if (result.error) {
      let placeholder= remove? 'verwijderen ': 'opslaan'
      this._ui.error(`Fout bij ${placeholder} klant:  + ${result.error}`)
    }
    else {
        if (remove) this._ui.deletedIcon()
        else this._ui.successIcon()
        this.navigate(['/booking'])
    }   
  }

  onCancel(){
    this._ui.cancelledIcon()
    this._router.navigate(['/booking'])
  }
public navigate(commands: any[]): void {
    this.ngZone.run(() => this._router.navigate(commands)).then();
}
  onDelete () {
    const modalRef = this._modalService.open(ModalConfirmComponent);
    modalRef.componentInstance.title = 'Klant verwijderen';
    modalRef.componentInstance.message = 'Verwijder klant';
    modalRef.componentInstance.messageHighlighted = this.customer.name;
    modalRef.result
    .then(()=>{ //Modal closed appropriately

        //throw new Error('testen van errors!')
        this._ds.removeCustomerCascading(this.customer).pipe(take(1))
          .subscribe((result)=>{
            console.log('removeCustomerCascading.subscribe')
            this.handlePersistResponse(result, 'remove')
          })
    })
    .catch(()=>{
      console.log('modal cancelled')
    })
  }
}

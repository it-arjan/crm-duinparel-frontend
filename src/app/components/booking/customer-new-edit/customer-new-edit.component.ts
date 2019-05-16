import { Component, OnInit, NgZone, OnDestroy, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { Customer } from 'src/app/models/customer.model';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { UIService } from 'src/app/services/ui.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '../../ng-bootstrap/modal-confirm/modal-confirm.component';
import { take } from 'rxjs/operators';
import { tGuistate, tGuiguidance, tComponentNames } from 'src/app/services/interfaces/interfaces.ui';
import { TData } from '@angular/core/src/render3/interfaces/view';
import { tDataResult } from 'src/app/services/interfaces/interfaces.persist';
import { Subscription } from 'rxjs';
import { UIGuidableComponent } from 'src/app/services/base/ui.guidable.component';

@Component({
  selector: 'app-customer-new-edit',
  templateUrl: './customer-new-edit.component.html',
  styles: [``]
})
export class CustomerNewEditComponent implements OnInit, OnDestroy {

  constructor(
    private _ds: DataService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _ui: UIService,
    private ngZone: NgZone,
    private _modalService: NgbModal,
  ) {

  }
  name: tComponentNames.newEditCustomer
  reactiveForm: FormGroup;
  editMode: boolean;
  custId: number;
  customer: Customer;
  dataAvailable = false
  unsublist: Subscription[] = []

  ngOnInit() {
    //this.initForm()
    this._activatedRoute.params.subscribe( //subscription is cleanedup automatically in this case
      (params: Params) => {
        this.editMode = params['custid'] != null;
        if (this.editMode) {
          //console.log('editMode')
          this.custId = +params['custid'];
          this._ds.dataReadyReplay().pipe(take(1)) // auto-unsub
            .subscribe(() => {
              this.customer = this._ds.getCustomer(this.custId)
              this.initForm()
              this.dataAvailable = true
            })
        } else {
          this.initForm()
          this.dataAvailable = true
          this.custId = -1
        }
      })
  }

  ngOnDestroy() {
    this.unsublist.forEach(x => x.unsubscribe())
  }


  private initForm() {
    let name = '', address = '', email = '', country = '', phone = ''
    if (this.editMode) {
      name = this.customer.name
      address = this.customer.address
      email = this.customer.email
      phone = this.customer.phone
      country = this.customer.country
    }
    //create form
    this.reactiveForm = new FormGroup({
      'name': new FormControl(name, Validators.required),
      'address': new FormControl(address, Validators.required),
      'email': new FormControl(email, [Validators.required, Validators.email]),
      'phone': new FormControl(phone),
      'country': new FormControl(country),
    })
    //subscribe to form changes
    this.unsublist.push(
      this.reactiveForm.valueChanges.subscribe(val => {
        this._ui.checkin(this.editMode ? tGuistate.customerEditDataDirty : tGuistate.customerNewDataDirty)
      })
    )
  }

  onSubmit() {
    try {
      let editedCustomer = new Customer(this.custId,
        this.reactiveForm.get('name').value,
        this.reactiveForm.get('address').value,
        this.reactiveForm.get('email').value,
        this.reactiveForm.get('phone').value,
        this.reactiveForm.get('country').value,
        []
      )

      if (this.editMode) {
        editedCustomer.bookings = this.customer.bookings
        this._ds.updateCustomer(this.custId, editedCustomer).pipe(take(1))
          .subscribe((result) => {
            this.handlePersistResponse(result)
          })
      }
      else {
        console.log('before: ' + editedCustomer.id)
        this._ds.addCustomer(editedCustomer, '/booking').pipe(take(1))
          .subscribe((result: tDataResult) => {
            console.log('Cust comp: Receiving addCustomer response')
            this.handlePersistResponse(result)
          })
      }
    }
    catch (ex) {
      this._ui.error('Opslaan mislukttt ' + ex)
    }
  }

  handlePersistResponse(result: tDataResult, remove?: string) {
    if (result.error) {
      let placeholder = remove ? 'verwijderen ' : 'opslaan'
      this._ui.error(`Fout bij ${placeholder} klant:  + ${result.error}`)
    }
    else {
      if (remove) this._ui.deletedIcon()
      else this._ui.successIcon()

      this._ui.checkin(tGuistate.customerClose)
      this.navigate(['/booking'])
    }
  }

  onCancel() {
    this._ui.cancelledIcon()
    this._ui.checkin(tGuistate.customerClose)
    this._router.navigate(['/booking'])
  }

  public navigate(commands: any[]): void {
    this.ngZone.run(() => this._router.navigate(commands)).then();
  }

  onDelete() {
    const modalRef = this._modalService.open(ModalConfirmComponent);
    modalRef.componentInstance.title = 'Klant verwijderen';
    modalRef.componentInstance.message = 'Verwijder klant';
    modalRef.componentInstance.messageHighlighted = this.customer.name;
    modalRef.result
      .then(() => { //Modal closed appropriately

        //throw new Error('testen van errors!')
        this._ds.removeCustomerCascading(this.customer).pipe(take(1))
          .subscribe((result) => {
            console.log('removeCustomerCascading.subscribe')
            this.handlePersistResponse(result, 'remove')
          })
      })
      .catch(() => {
        console.log('modal cancelled')
      })
  }
}

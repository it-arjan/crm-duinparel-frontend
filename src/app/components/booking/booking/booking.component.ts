import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Customer } from 'src/app/models/customer.model';
import { NgbModal, NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '../../ng-bootstrap/modal-confirm/modal-confirm.component';
import { UIService } from 'src/app/services/ui.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Booking } from 'src/app/models/booking.model';
import { ModalDaterangeSelectComponent } from '../../ng-bootstrap/modal-daterange-select/modal-daterange-select.component';
import { Globals } from '../../../shared/globals';

import * as moment from 'moment';
import { BackendService } from 'src/app/services/backend.service';
import { take } from 'rxjs/operators';
import { FakeBackendService } from 'src/app/services/fake.data.backend.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styles: [`
    `]
})
export class BookingComponent implements OnInit {

  constructor(
    private _bs: BackendService, 
    private _ds: DataService, 
    private _modalService: NgbModal,
    private _ui : UIService,
    private _router: Router, 
    private _activatedRoute: ActivatedRoute) { 

  }
  
  propCodes = Globals.propCodes
  bookTypes = Globals.bookTypes

  dpDisplayMonths = 2;
  dpNnavigation = 'select';
  dpShowWeekNumbers = false;
  dpOoutsideDays = 'visible';
  mindateArrive : NgbDate = null
  mindateDepart : NgbDate = null
  reactiveForm: FormGroup;
  custId: number;
  customer: Customer;

  ngOnInit() {
  this._activatedRoute.params.subscribe( //route subscriptions are cleaned up automatically
    (params: Params) => {
      this.custId = +params['custid']
      this._ds.dataReadyReplay().pipe(take(1))
       .subscribe(()=>{
          this.customer = this._ds.getCustomer(this.custId)
       })
    });
    this.initForm()
  }

  initForm(){
    this.reactiveForm = new FormGroup({
      'arrive': new FormControl('',[Validators.required, Validators.pattern(Globals.momDatePattern), this.datesValid.bind(this)]),
      'depart': new FormControl('',[Validators.required, Validators.pattern(Globals.momDatePattern), this.datesValid.bind(this)]),
      'propcode': new FormControl('',[Validators.required]),
      'booktype': new FormControl('',[Validators.required]),
    })
  }

  globDateformat(){
    return Globals.angularDateformat;
  }

  datesValid(control: FormControl) : {[s: string]: boolean}{
    //PS: call as validator with bind(this)
    if (this.reactiveForm &&  //needed, is somehow called before this.reactiveForm is instantiated
      this.reactiveForm.get('arrive').value && //only check when both dates are filled
      this.reactiveForm.get('depart').value &&
      Globals.momDatePattern.test(this.reactiveForm.get('arrive').value) && //and our global dateformat regex passes
      Globals.momDatePattern.test(this.reactiveForm.get('depart').value)){
      
      let m_arrive = moment(this.reactiveForm.get('arrive').value, Globals.momDateformat);
      let m_depart = moment(this.reactiveForm.get('depart').value, Globals.momDateformat);
      let formatRecognized = m_arrive.isValid() && m_depart.isValid()
      if (!formatRecognized){
        if (!m_arrive.isValid()) this._ui.error("Aankomst wordt niet als datum herkend!")
        if (!m_depart.isValid()) this._ui.error("Vertrek wordt niet als datum herkend!")

        return {'dateInvalid': true} 
      }
      else if(m_arrive.isSame(m_depart) || m_arrive.isAfter(m_depart)) {
        this._ui.error("vertrek moet later zijn dan de aankomst!")

        return {'dateInvalid': true} 
      }
      this._ui.info("vertrek en aankomst zijn ok")
      return null
    }
    return null  
  }
  
  onSubmit(){
    let m_arrive = moment(this.reactiveForm.get('arrive').value, Globals.momDateformat);
    let m_depart = moment(this.reactiveForm.get('depart').value, Globals.momDateformat);
    console.log(m_arrive, m_depart)
    let propcode = this.reactiveForm.get('propcode').value;
    let booktype = this.reactiveForm.get('booktype').value;

    let booking = new Booking(0, this.custId, m_arrive.unix()*1000, m_depart.unix()*1000, propcode, booktype)
    //this.customer.bookings.push(booking)
    this._ds.addBooking(booking).pipe(take(1))
    .subscribe((result)=>{
      if (result.error) {
        this._ui.error('Fout bij opslaan booking: ' + result.error)
      }
      else {
        this.reactiveForm.setValue({arrive:'',depart:'',propcode:'',booktype:''});
        this._ui.successIcon()
      }
      
    })

  }

  openModalCalendar(){
    const modalRef = this._modalService.open(ModalDaterangeSelectComponent);
    modalRef.result
        .then((result)=>{
          let m_arrive = moment([result.fromNgb.year, result.fromNgb.month-1, result.fromNgb.day])
          let m_depart = moment([result.toNgb.year, result.toNgb.month-1, result.toNgb.day])
          this.reactiveForm.patchValue({'arrive':m_arrive.format(Globals.momDateformat),'depart':m_depart.format(Globals.momDateformat)})
        })
        .catch((err)=>{
          console.log(err)
        })
  }

  onWord(idx:number){
    this._bs.writeWordBooking(this.customer, this.customer.bookings[idx])
    .then((result: {wordFilename:string, wordFolder:string})=>{
      this._ui.info(`De boeking staat in ${result.wordFolder} and has name ${result.wordFilename}`)
    })
    .catch((result: {wordFilename:string, wordFolder:string})=>{
      this._ui.error(`${result.wordFolder}, ${result.wordFilename}`)
    })
  }
  onDelete (idx:number) {
    let arrive = moment(this.customer.bookings[idx].arrive).format(Globals.momDateformat)
    let depart = moment(this.customer.bookings[idx].arrive).format(Globals.momDateformat)
    const modalRef = this._modalService.open(ModalConfirmComponent);
    modalRef.componentInstance.title = 'Boeking verwijderen';
    modalRef.componentInstance.message = 'Verwijder Boeking';
    modalRef.componentInstance.messageHighlighted = `${this.customer.bookings[idx].propcode} van  ${arrive} tot ${depart}`

    modalRef.result
        .then(()=>{
          try {
            //throw new Error('testen van errors!')
            this._ds.removeBooking(this.customer.bookings[idx]).pipe(take(1))
            .subscribe((result)=>{
              if (result.error) {
                this._ui.error('Fout bij verwijderen boeking: ' + result.error)
              }
              else {
                this.reactiveForm.setValue({arrive:'',depart:'',propcode:'',booktype:''});
                    this._ui.deletedIcon()
              }
            })
          }
          catch (err){
            this._ui.error('verwijderen mislukt: ' + err)
            console.log(err)
          }
        })
        .catch(()=>{ //catch van de modal popup then
          console.log('modal cancelled')

        })
  }      
}

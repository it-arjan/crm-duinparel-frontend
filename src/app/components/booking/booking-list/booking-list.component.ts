import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Customer } from 'src/app/models/customer.model';
import { NgbModal, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '../../ng-bootstrap/modal-confirm/modal-confirm.component';
import { UIService } from 'src/app/services/ui.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { Booking } from 'src/app/models/booking.model';

@Component({
  selector: 'app-booking-list',
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.css']
})
export class BookingListComponent implements OnInit {

  constructor(
    private _ds: DataService, 
    private _modalService: NgbModal,
    private _ui : UIService,
    private _router: Router, 
    private _activatedRoute: ActivatedRoute) { 

  }
  
  propCodes = ['app','alba','jvg']

  dpDisplayMonths = 2;
  dpNnavigation = 'select';
  dpShowWeekNumbers = false;
  dpOoutsideDays = 'visible';
  dpminDate : NgbDate = null

  reactiveForm: FormGroup;
  custId: number;
  customer: Customer;

  setupDp(){
    this.dpDisplayMonths = 2;
    this.dpNnavigation = 'select';
    this.dpShowWeekNumbers = false;
    this.dpOoutsideDays = 'visible';
    let d = new Date();
    this.dpminDate = new NgbDate(d.getFullYear(), d.getMonth()+1, d.getDate())
    console.log(this.dpminDate)
    console.log(d.getDate())
  }


  ngOnInit() {
  this._activatedRoute.params.subscribe( //subscription is cleanedup automatically in this case
    (params: Params) => {
      console.log(params)
      console.log('editMode')
      this.custId = +params['custid'];
      this.customer = this._ds.getCustomer(this.custId);  
    });
    this.initForm()
    this.setupDp()
  }
  
  initForm(){
    this.reactiveForm = new FormGroup({
      'arrive': new FormControl('',[Validators.required, this.departureLaterThenArrival.bind(this)]),
      'depart': new FormControl('',[Validators.required, this.departureLaterThenArrival.bind(this)]),
      'propcode': new FormControl('',[Validators.required]),
    })
  }
  departureLaterThenArrival(control: FormControl) : {[s: string]: boolean}{
    //PS: use as validator with bind(this)
    if (this.reactiveForm &&  //can be called before this.reactiveForm is instantiated
      this.reactiveForm.get('arrive').value && //only check when both dates are filled
      this.reactiveForm.get('depart').value){
      
      let ngbArrive:NgbDate = this.reactiveForm.get('arrive').value;
      let ngbDepart:NgbDate = <NgbDate>(this.reactiveForm.get('depart').value);
      console.log(ngbDepart)
      if(this.inValid(ngbDepart,ngbArrive)) {
        this._ui.error("vertrek moet later zijn dan de aankomst!")
        return {'departurelater': true} 
      }
      this._ui.info("vertrek en aankomst zijn ok")
      return null
    }
    return null  
  }
  //copy of NgbDate.before: not defined? ..as validator is called from browser?
  inValid(d1: NgbDate, d2: NgbDate): boolean{
    if (!d2) {
      return false;
    }

    if (d1.year === d2.year) {
      if (d1.month === d2.month) {
        return d1.day <= d2.day;
      } else {
        return d1.month <= d2.month;
      }
    } else {
      return d1.year <= d2.year;
    }
  }
  onSubmit(){
    let ngbArrive = this.reactiveForm.get('arrive').value;
    let arrive = new Date(ngbArrive.year, ngbArrive.month-1, ngbArrive.day);

    let ngbDepart = this.reactiveForm.get('depart').value;
    let depart = new Date(ngbDepart.year, ngbDepart.month-1, ngbDepart.day);

    let propcode = this.reactiveForm.get('propcode').value;

    let booking = new Booking(0, this.custId, arrive, depart, propcode)
    //this.customer.bookings.push(booking)
    this._ds.addBooking(this.custId,booking)

    this.reactiveForm.setValue({arrive:'',depart:'',propcode:''});
    this._ui.success()
  }

  onDelete (idx:number) {
    const modalRef = this._modalService.open(ModalConfirmComponent);
    modalRef.componentInstance.title = 'Boeking verwijderen';
    modalRef.componentInstance.message = 'Verwijder Boeking';
    modalRef.componentInstance.messageHighlighted = 
              this.customer.bookings[idx].propcode +
              ' van ' + this.customer.bookings[idx].arrive.toLocaleDateString() 
                + ' tot ' + this.customer.bookings[idx].depart.toLocaleDateString();
    modalRef.result
        .then(()=>{
          try {
            //throw new Error('testen van errors!')
            this.customer.bookings.splice(idx,1)
            this._ui.broadCastRemoval()
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

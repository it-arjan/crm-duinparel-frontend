import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Customer } from 'src/app/models/customer.model';
import { NgbModal, NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '../../ng-bootstrap/modal-confirm/modal-confirm.component';
import { UIService } from 'src/app/services/ui.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { Booking } from 'src/app/models/booking.model';
import * as moment from 'moment';
import { ModalDaterangeSelectComponent } from '../../ng-bootstrap/modal-daterange-select/modal-daterange-select.component';

@Component({
  selector: 'app-booking-list',
  templateUrl: './booking-list.component.html',
  styles: [`
  .vcenter {
    display: flex;
    align-items: center;
  }
    `]
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
  bookTypes = ['week','midweek','weekend']

  dpDisplayMonths = 2;
  dpNnavigation = 'select';
  dpShowWeekNumbers = false;
  dpOoutsideDays = 'visible';
  mindateArrive : NgbDate = null
  mindateDepart : NgbDate = null
  reactiveForm: FormGroup;
  custId: number;
  customer: Customer;

  
  setupDp(){
    this.dpDisplayMonths = 2;
    this.dpNnavigation = 'select';
    this.dpShowWeekNumbers = false;
    this.dpOoutsideDays = 'visible';
    let m = moment();
    //console.log('moment: '+m.format('DD/MMM/YY') + ', year: ' + moment().year())
    this.mindateArrive = new NgbDate(m.year(), m.month()+1, m.date())
    m.add(1, 'days');
    this.mindateDepart = new NgbDate(m.year(), m.month()+1, m.date())
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
      'booktype': new FormControl('',[Validators.required]),
    })
  }

  departureLaterThenArrival(control: FormControl) : {[s: string]: boolean}{
    //PS: call as validator with bind(this)
    if (this.reactiveForm &&  //needed, is somehow called before this.reactiveForm is instantiated
      this.reactiveForm.get('arrive').value && //only check when both dates are filled
      this.reactiveForm.get('depart').value){
      
        let m_arrive = moment(this.reactiveForm.get('arrive').value, "DD MMM YY");
        let m_depart = moment(this.reactiveForm.get('depart').value, "DD MMM YY");
        
      if(m_arrive.isSame(m_depart) || m_arrive.isAfter(m_depart)) {
        this._ui.error("vertrek moet later zijn dan de aankomst!")
        return {'departurelater': true} 
      }
      this._ui.info("vertrek en aankomst zijn ok")
      return null
    }
    return null  
  }
  
  onSubmit(){
    let m_arrive = moment(this.reactiveForm.get('arrive').value, "DD MMM YY");
    let js_arrive = new Date(m_arrive.year(), m_arrive.month(), m_arrive.date());

    let m_depart = moment(this.reactiveForm.get('depart').value, "DD MMM YY");
    let js_depart = new Date(m_depart.year(), m_depart.month(), m_depart.date());

    let propcode = this.reactiveForm.get('propcode').value;
    let booktype = this.reactiveForm.get('booktype').value;

    let booking = new Booking(0, this.custId, js_arrive, js_depart, propcode, booktype)
    //this.customer.bookings.push(booking)
    this._ds.addBooking(this.custId,booking)

    this.reactiveForm.setValue({arrive:'',depart:'',propcode:'',booktype:''});
    this._ui.success()
  }
  openModalCalendar(){
    const modalRef = this._modalService.open(ModalDaterangeSelectComponent);
    modalRef.result
        .then((result)=>{
          console.log('closed')
          let m_arrive = moment([result.fromNgb.year, result.fromNgb.month-1, result.fromNgb.day])
          let m_depart = moment([result.toNgb.year, result.toNgb.month-1, result.toNgb.day])
          this.reactiveForm.patchValue({'arrive':m_arrive.format('DD MMM YY'),'depart':m_depart.format('DD MMM YY')})
          console.log(result.fromNgb, result.toNgb)
        })
        .catch((err)=>{
          console.log(err)
        })
    
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

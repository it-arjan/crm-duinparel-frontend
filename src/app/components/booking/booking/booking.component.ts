import { Component, OnInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Customer } from 'src/app/models/customer.model';
import { NgbModal, NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '../../ng-bootstrap/modal-confirm/modal-confirm.component';
import { UIService } from 'src/app/services/ui.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Booking } from 'src/app/models/booking.model';
import { ModalDaterangeSelectComponent } from '../../ng-bootstrap/modal-daterange-select/modal-daterange-select.component';
import { Globals, tDateError } from '../../../shared/globals';

import * as moment from 'moment';
import 'moment/locale/nl'  // without this line it didn't work
moment.locale('nl')
import { BackendBase } from 'src/app/services/base/backend.base.service';
import { take } from 'rxjs/operators';
import { tGuistate, tGuiguidance, tComponentNames } from 'src/app/services/interfaces/interfaces.ui';
import { Subscription } from 'rxjs';
import { UIGuidableComponent } from 'src/app/services/base/ui.guidable.component';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styles: [`
:host {
    display: block;
    }
`]
})
export class BookingComponent extends UIGuidableComponent implements OnInit, OnDestroy {

  constructor(
    private _bs: BackendBase,
    private _ds: DataService,
    private _cd: ChangeDetectorRef,
    private _modalService: NgbModal,
    private _ui: UIService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _r2: Renderer2) {

    super(_r2);
    super.setGuidanceName(tComponentNames.listBooking)
  }

  @ViewChild("booking_cover") coverRef: ElementRef
  @ViewChild("booking_outer") outerRef: ElementRef

  propCodes = Globals.propCodes
  bookTypes = Globals.bookTypes

  dpDisplayMonths = 2;
  dpNnavigation = 'select';
  dpShowWeekNumbers = false;
  dpOoutsideDays = 'visible';
  mindateArrive: NgbDate = null
  mindateDepart: NgbDate = null
  reactiveForm: FormGroup;
  custId: number;
  customer: Customer;
  unsublist: Subscription[] = []

  ngOnInit() {
    this._activatedRoute.params.subscribe( //route subscriptions are cleaned up automatically
      (params: Params) => {
        this.custId = +params['custid']
        this._ds.dataReadyReplay().pipe(take(1))
          .subscribe(() => {
            this.customer = this._ds.getCustomer(this.custId)
          })
      });
    this.initForm()

    this.unsublist.push(
      this._ui.guider()
        .subscribe((guidance: tGuiguidance) => {
          console.log(guidance)
          this.handleGuidance(this.outerRef, this.coverRef, guidance)
        })
    )
    this.unsublist.push(
      this.reactiveForm.valueChanges.subscribe(val => {
        this._ui.checkin(tGuistate.bookingDataDirty)
      })
    )
  }

  ngOnDestroy() {
    this.unsublist.forEach(x => x.unsubscribe())
  }

  initForm() {
    this.reactiveForm = new FormGroup({
      'arrive': new FormControl('', [Validators.required, Validators.pattern(Globals.momDatePattern), this.datesValid.bind(this)]),
      'depart': new FormControl('', [Validators.required, Validators.pattern(Globals.momDatePattern), this.datesValid.bind(this)]),
      'nrpers': new FormControl('', [Validators.required, Validators.min(0)]),
      'propcode': new FormControl('', [Validators.required]),
      'booktype': new FormControl('', [Validators.required]),
    })
  }

  globDateformat() {
    return Globals.angularDateformat;
  }

  datesValid(control: FormControl): { [s: string]: boolean } {
    //PS: call as validator with bind(this)
    let result: { [s: string]: boolean } = null
    let frm_arrive: string, frm_depart: string
    if (this.reactiveForm) {  //needed, is somehow called before this.reactiveForm is instantiated
      //we need both dates to determine validity
      frm_arrive = this.reactiveForm.get('arrive').value
      frm_depart = this.reactiveForm.get('depart').value
      let intResult = Globals.checkDates(frm_arrive, frm_depart)
      //only check when both dates are filled and our global dateformat regex passes
      if (!intResult.valid) {
        result = { 'dateInvalid': true }
        this.handleDateError(intResult.error)
      }
    }
    return result
  }
  handleDateError(error: tDateError) {
    if (error === tDateError.arrive_invalid) this._ui.error("Aankomst wordt niet als datum herkend!")
    if (error === tDateError.depart_invalid) this._ui.error("Vertrek wordt niet als datum herkend!")
    if (error === tDateError.depart_before_arrive) this._ui.error("vertrek moet later zijn dan de aankomst!")
  }
  onSubmit() {
    let m_arrive = moment(this.reactiveForm.get('arrive').value, Globals.momDateformat);
    let m_depart = moment(this.reactiveForm.get('depart').value, Globals.momDateformat);
    console.log(m_arrive, m_depart)
    let nrpers: number = +this.reactiveForm.get('nrpers').value;
    let propcode: string = this.reactiveForm.get('propcode').value;
    let booktype: string = this.reactiveForm.get('booktype').value;

    let booking = new Booking(0, this.custId, m_arrive.unix() * 1000, m_depart.unix() * 1000, nrpers, propcode, booktype)
    //this.customer.bookings.push(booking)
    this._ds.addBooking(booking).pipe(take(1))
      .subscribe((result) => {
        if (result.error) {
          this._ui.error('Fout bij opslaan booking: ' + result.error)
        }
        else {
          this.reactiveForm.setValue({ arrive: '', depart: '', nrpers: '', propcode: '', booktype: '' });
          this._ui.successIcon()

          this._cd.detectChanges()
        }
      })
  }

  openModalCalendar() {
    const modalRef = this._modalService.open(ModalDaterangeSelectComponent);
    modalRef.result
      .then((result) => {
        let m_arrive = moment([result.fromNgb.year, result.fromNgb.month - 1, result.fromNgb.day])
        let m_depart = moment([result.toNgb.year, result.toNgb.month - 1, result.toNgb.day])
        this.reactiveForm.patchValue({ 'arrive': m_arrive.format(Globals.momDateformat), 'depart': m_depart.format(Globals.momDateformat) })
      })
      .catch((err) => {
        console.log(err)
      })
  }

  onWord(idx: number) {
    this._bs.writeWordBooking(this.customer, this.customer.bookings[idx])
      .then((result: { wordFilename: string, wordFolder: string }) => {
        this._ui.info(`De boeking staat in ${result.wordFolder} and has name ${result.wordFilename}`)
      })
      .catch((result: { wordFilename: string, wordFolder: string }) => {
        this._ui.error(`${result.wordFolder}, ${result.wordFilename}`)
      })
  }

  onDelete(idx: number) {
    let arrive = moment(this.customer.bookings[idx].arrive).format(Globals.momDateformat)
    let depart = moment(this.customer.bookings[idx].arrive).format(Globals.momDateformat)
    const modalRef = this._modalService.open(ModalConfirmComponent);
    modalRef.componentInstance.title = 'Boeking verwijderen';
    modalRef.componentInstance.message = 'Verwijder Boeking';
    modalRef.componentInstance.messageHighlighted = `${this.customer.bookings[idx].propcode} van  ${arrive} tot ${depart}`

    modalRef.result
      .then(() => {
        try {
          //throw new Error('testen van errors!')
          this._ds.removeBooking(this.customer.bookings[idx]).pipe(take(1))
            .subscribe((result) => {
              if (result.error) {
                this._ui.error('Fout bij verwijderen boeking: ' + result.error)
              }
              else {
                this._ui.deletedIcon()
                this._cd.detectChanges()
              }
            })
        }
        catch (err) {
          this._ui.error('verwijderen mislukt: ' + err)
          console.log(err)
        }
      })
      .catch(() => { //catch van de modal popup then
        console.log('modal cancelled')

      })
  }
  onClose() {
    this._ui.checkin(tGuistate.bookingsOfCustomerClose)
    this._ui.cancelledIcon()
    this._router.navigate(['/booking'])
  }
}

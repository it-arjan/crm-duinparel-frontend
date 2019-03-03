import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CustomerBatch } from 'src/app/models/customerbatch.model';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from 'src/app/services/data.service';
import { UIService } from 'src/app/services/ui.service';
import { Globals, tDateError } from 'src/app/shared/globals';
import { Customer } from 'src/app/models/customer.model';
import { take } from 'rxjs/operators';
import { Mailing } from 'src/app/models/mailing.model';
import { ModalConfirmComponent } from '../../ng-bootstrap/modal-confirm/modal-confirm.component';
import * as moment from 'moment';
import { tPersist, tDataResult } from 'src/app/services/interfaces.persist';
import { ModalDaterangeSelectComponent } from '../../ng-bootstrap/modal-daterange-select/modal-daterange-select.component';

@Component({
  selector: 'app-mailing-wrap',
  templateUrl: './mailing.component.html',
  styles: [`
  .btn-group-toggle .active {margin-left: 5px;margin-right: 5px;} 
  .pad {padding:5px;font-size:12px}
  .space {margin-left: 5px;margin-right: 5px;}
  .strike{text-decoration: line-through}
  `]
})
export class MailingComponent implements OnInit {

  constructor(
    private _ds: DataService, 
    private _ui : UIService,
    private _modalService: NgbModal,
    ) {
    }

  selectionAsBatches :CustomerBatch[]
  reactiveForm: FormGroup;
  propTypes = Globals.propTypesMailing
  bookTypes = Globals.bookTypes
  selectedPropCodes: Array<string> = []
  selectedBookTypes: Array<string> = []
  visitedFrom = 24 //todo maak setting
  visitedUntil = 0 //todo maak setting
  mailedSinceFrom = 0  //todo maak setting
  totalVisists = 0 //todo maak setting

  lastSavedmailing: Mailing
  batchesCopied_Idx: number[] = []

  @ViewChild('b1') b1Tag: ElementRef; 
  @ViewChild('b2') b2Tag: ElementRef; 

  ngOnInit() {
    this.initForm()
    // attempt to speed up the load of the tooltips on the b1/b2 buttons
    if (this.b1Tag) this.triggerHover(this.b1Tag)
    if (this.b2Tag) this.triggerHover(this.b2Tag)
  }

  triggerHover(eltRef:ElementRef){
    var event = new MouseEvent('mouseover', {
      'view': window,
      'bubbles': true,
      'cancelable': true
    });
    
    eltRef.nativeElement.dispatchEvent(event);
  }

  onMouseover(){
    //console.log('Event triggered');
  }

  countSelectedEmails(){
    let result=0
    for (let b of this.selectionAsBatches){
      result += b.custList.length
    }
    return result
  }

  initForm(){
    this.reactiveForm = new FormGroup({
      'slot': new FormControl('',{validators: this.slotValidVal.bind(this), updateOn: "blur"}),
      'visitedFrom': new FormControl(this.visitedFrom,[Validators.required, Validators.pattern(/[1-9][0-9]*/)]), 
      'visitedUntil': new FormControl(this.visitedUntil>0?this.visitedUntil:undefined,[Validators.pattern(/[1-9][0-9]*/)]), 
      'mailedSinceFrom': new FormControl(this.mailedSinceFrom>0?this.mailedSinceFrom:undefined,[Validators.pattern(/[1-9][0-9]*/)]), 
      'totalVisists': new FormControl(this.totalVisists>0?this.totalVisists:undefined,[Validators.pattern(/[1-9][0-9]*/)]), 
      'propType': new FormControl('',[Validators.required]),
      'bookTypeCheckboxes': new FormGroup({
           //add checkbox formcontrols dynamically below, Angular 6 
      }),
    })
    //add checkbox formcontrols
    const checkboxes = <FormGroup>this.reactiveForm.get('bookTypeCheckboxes');
    this.bookTypes.map(x=>checkboxes.addControl(x, new FormControl(true)))
  }
  testPattern(slot){
    return Globals.slotPattern.test(slot)
  }
   getErrorWhenPatternOk(){
    let slot=this.reactiveForm.get('slot').value
    if (slot) slot=slot.replace(/\s/g,'')
    //if (this.testPattern(slot) )
      return this.getErrorMessage(slot)
  return null
  } 
  validSlotEntered(){
    let slot=this.reactiveForm.get('slot').value
    if (slot) slot=slot.replace(/\s/g,'')
    return this.getErrorMessage(slot)==null
  }
  slotDataEntered(){
    let slot=this.reactiveForm.get('slot').value
    return slot && slot.length > 0
  }
  //checkSlot is called from validator and from template (through validSlotEntered)
  getErrorMessage(slot:string): string {
    if (!this.testPattern(slot))
      return "Patroon: dag/maand, dag/maand"
    let arr_fromuntil = slot.split(',')
    let from= arr_fromuntil[0]
    let until= arr_fromuntil[1]
    let errormsg=null
    //format should be day_nr/month_nr
    let fromparts = from.split('/')
    if ( Number(fromparts[0]) <1 || Number(fromparts[0]) > 31) 
      errormsg= "Dag in periode-van moet tussen 1-31."
    if (!errormsg && Number(fromparts[1]) <1 || Number(fromparts[1]) > 12 ) 
      errormsg= "Maand in periode-van moet tussen 1-12."
    
    let untilparts = until.split('/')
    if (!errormsg && Number(untilparts[0]) <1 ||Number(untilparts[0]) > 31 )
      errormsg= "Dag in periode-tot moet tussen 1-31."
    if (!errormsg && Number(untilparts[1]) <1 ||Number(untilparts[1]) > 12 )
      errormsg= "Maand in periode-tot moet tussen 1-12."
    // console.log(`months:  ${fromparts[1]}, ${untilparts[1]}`)
    // console.log(`days:  ${fromparts[0]}, ${untilparts[0]}`)
    //check if until is after from
    if (!errormsg && fromparts[1]>untilparts[1] || (fromparts[1]===untilparts[1] && fromparts[0]>=untilparts[0]))
      errormsg= "periode-tot is eerder dan periode-van."
    return errormsg
  }

  slotValidVal(control: FormControl) : {[s: string]: boolean}{
    //PS: called as validator onBlur and with bind(this)
    let result:{[s: string]:boolean}=null
    if (this.reactiveForm){  //needed, is somehow called before this.reactiveForm is instantiated
      //only check when there is data entered
      if (this.slotDataEntered()){
        let frm_slot:string= this.reactiveForm.get('slot').value
        if (frm_slot) 
          frm_slot=frm_slot.replace(/\s/g,'') 
        let errormsg:string = this.getErrorMessage(frm_slot)
        if (errormsg){
          result = {'dateInvalid': true} 
        } 
      }
    }
    return result
  }

  setSelectedBooktypes(checkboxes:FormGroup){
    this.selectedBookTypes.length=0 //clear array
    for (let booktype of this.bookTypes){
      if (checkboxes.get(booktype).value) this.selectedBookTypes.push(booktype)
    }
  }

  onSubmit(){
    this.resetScreen()
    let str_slot:string = this.reactiveForm.get('slot').value
    if (str_slot) str_slot=str_slot.replace(/\s/g,'')

    this.visitedFrom = this.reactiveForm.get('visitedFrom').value
    this.visitedUntil = this.reactiveForm.get('visitedUntil').value
    this.mailedSinceFrom = this.reactiveForm.get('mailedSinceFrom').value
    this.totalVisists = this.reactiveForm.get('totalVisists').value

    this.selectedPropCodes = Globals.propType2PropCode(this.reactiveForm.get('propType').value )
    this.setSelectedBooktypes(<FormGroup>this.reactiveForm.get('bookTypeCheckboxes'))

    // console.log(this.visitedFrom,this.visitedUntil,
    //   this.mailedSinceFrom,this.totalVisists,
    //   this.selectedPropCodes, this.selectedBookTypes)
      
    this.selectionAsBatches = this._ds.searchEmails(str_slot, 
                                                  this.visitedFrom,this.visitedUntil,
                                                  this.mailedSinceFrom,this.totalVisists,
                                                  this.selectedPropCodes, this.selectedBookTypes)
   // console.log(this.selectionAsBatches)
    }

  rememberMailing(){
    //create mailing
    //add these cusIds
    //store it
    let custidList : number[]=[]
    this.selectionAsBatches.forEach(x=>x.custList.map(c => custidList.push(c.id)))
    this._ds.addMailing(custidList).pipe(take(1))
      .subscribe((dataresult)=>{
        this.handleResponse(dataresult, tPersist.Insert)
      })
  }
  
  resetScreen(){
    this.lastSavedmailing=null
  }

  handleResponse(dataresult: tDataResult, type:tPersist){
    if (dataresult.error){
      this._ui.error(tPersist[type] + ' mislukt. ' + dataresult.error)
    } else {
      this.lastSavedmailing = this._ds.getLastMailing()
      if (type === tPersist.Insert) this._ui.successIcon()
      if (type === tPersist.Delete) this._ui.deletedIcon()
    }
  }

  undoRememberMailing(){
    if (this.lastSavedmailing){
      this._ds.removeMailing(this.lastSavedmailing).pipe(take(1))
        .subscribe((dataResult) =>{
         this.handleResponse(dataResult, tPersist.Delete)
      })
    }
  }

  removeMailing(idx){
    let mail = this._ds.getMailings()[idx]
    const modalRef = this._modalService.open(ModalConfirmComponent);
    modalRef.componentInstance.title = 'Mailing verwijderen';
    modalRef.componentInstance.message = 'Verwijder mailing van';
    modalRef.componentInstance.messageHighlighted = moment(mail.sent).format(this.getGlobDateFormat('mom'))
    modalRef.result
    .then(()=>{ //Modal closed appropriately

        this._ds.removeMailing(mail).pipe(take(1))
          .subscribe((dataresult)=>{
              this.handleResponse(dataresult, tPersist.Delete)
          })
    })
    .catch(()=>{
      console.log('modal cancelled')
    })  
  }
  checkIfCopied(idx:number):boolean{ //for ngClass only
    //console.log('checkIfCopied. idx: ' + idx + ', ' + this.batchesCopied_Idx.includes(idx))
    return this.batchesCopied_Idx.includes(idx)
  }

  copyBatch(selectedEmail_Idx:number){
  
    let workaround: any = window.navigator; //workaround 4 a typescript typings issue
    if (!this.batchesCopied_Idx.includes(selectedEmail_Idx)){ 
      let csv = this.selectionAsBatches[selectedEmail_Idx].getEmailCsv()
      workaround.clipboard.writeText(csv)
      //toggle ON
      this.batchesCopied_Idx.push(selectedEmail_Idx)
    }
    else {
      workaround.clipboard.writeText('De emails moeten in het scherm doorgestreept zijn, alleen dan staan ze in het clipboard.')
      //toggle OFF
      this.batchesCopied_Idx.splice(this.batchesCopied_Idx.indexOf(selectedEmail_Idx), 1)
    }
  }
  getGlobDateFormat(type:string):string{
    return type ==='ang' ? Globals.angularDateformat: Globals.momDateformat
  }
}

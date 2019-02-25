import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CustomerBatch } from 'src/app/models/customerbatch.model';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from 'src/app/services/data.service';
import { UIService } from 'src/app/services/ui.service';
import { Globals } from 'src/app/shared/globals';
import { Customer } from 'src/app/models/customer.model';
import { take } from 'rxjs/operators';
import { Mailing } from 'src/app/models/mailing.model';

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
  mailingRemembered = false
  batchesCopied_Idx: number[] = []
  rememberedMailing: Mailing

  @ViewChild('b1') b1Tag: ElementRef; 
  @ViewChild('b2') b2Tag: ElementRef; 

  ngOnInit() {
    this.initForm()
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
      'visitedFrom': new FormControl(this.visitedFrom,[Validators.required, Validators.pattern(/[1-9][0-9]*/)]), 
      'visitedUntil': new FormControl(this.visitedUntil>0?this.visitedUntil:undefined,[Validators.pattern(/[1-9][0-9]*/)]), 
      'mailedSinceFrom': new FormControl(this.mailedSinceFrom>0?this.mailedSinceFrom:undefined,[Validators.pattern(/[1-9][0-9]*/)]), 
      'totalVisists': new FormControl(this.totalVisists>0?this.totalVisists:undefined,[Validators.pattern(/[1-9][0-9]*/)]), 
      'propType': new FormControl('',[Validators.required]),
      'bookTypeCheckboxes': new FormGroup({
       
      }),
    })
    //add checkbox formcontrols dynamically, Angular 6 
    const checkboxes = <FormGroup>this.reactiveForm.get('bookTypeCheckboxes');
    this.bookTypes.map(x=>checkboxes.addControl(x, new FormControl(true)))
  }
  
  setSelectedBooktypes(checkboxes:FormGroup){
    this.selectedBookTypes.length=0 //clear array
    for (let booktype of this.bookTypes){
      if (checkboxes.get(booktype).value) this.selectedBookTypes.push(booktype)
    }
  }

  onSubmit(){
    this.visitedFrom = this.reactiveForm.get('visitedFrom').value;
    this.visitedUntil = this.reactiveForm.get('visitedUntil').value;
    this.mailedSinceFrom = this.reactiveForm.get('mailedSinceFrom').value;
    this.totalVisists = this.reactiveForm.get('totalVisists').value;

    this.selectedPropCodes = Globals.propType2PropCode(this.reactiveForm.get('propType').value )
    this.setSelectedBooktypes(<FormGroup>this.reactiveForm.get('bookTypeCheckboxes'))

    // console.log(this.visitedFrom,this.visitedUntil,
    //   this.mailedSinceFrom,this.totalVisists,
    //   this.selectedPropCodes, this.selectedBookTypes)
      
    this.selectionAsBatches = this._ds.searchEmails(this.visitedFrom,this.visitedUntil,
                                                this.mailedSinceFrom,this.totalVisists,
                                                this.selectedPropCodes, this.selectedBookTypes)
   // console.log(this.selectionAsBatches)
    }

  rememberMailing(){
    //create mailing
    //add these cusIds
    //store it
    let custIdList : number[]=[]
    this.selectionAsBatches.forEach(x=>x.custList.map(c => custIdList.push(c.id)))
    this._ds.addMailing(custIdList).pipe(take(1))
      .subscribe((dataresult)=>{
          if (dataresult.error){
            this._ui.error('onthouden mailing mislukt. ' + dataresult.error)
          }
          else {
               this.mailingRemembered=true
               this.rememberedMailing=this._ds.getLastMailing()
             this._ui.successIcon()
          }
      })
  }

  undoRememberMailing(){
    this._ds.removeMailing(this.rememberedMailing).pipe(take(1))
      .subscribe((dataResult) =>{
          if (dataResult.error){
            this._ui.error('onthouden mailing mislukt. ' + dataResult.error)
          }
          else {
            this.mailingRemembered=false
               this.rememberedMailing=null
             this._ui.deletedIcon()
          }
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
}

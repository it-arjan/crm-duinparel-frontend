import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EmailBatch } from 'src/app/models/emailbatch.model';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from 'src/app/services/data.service';
import { UIService } from 'src/app/services/ui.service';
import { Globals } from 'src/app/shared/globals';

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

  selectedEmails :EmailBatch[]
  reactiveForm: FormGroup;
  propTypes = Globals.propTypesMailing
  bookTypes = Globals.bookTypes
  selectedPropCodes: Array<string> = []
  selectedBookTypes: Array<string> = []
  visitedFrom=24 //todo maak setting
  visitedUntil=0 //todo maak setting
  mailedSinceFrom=0  //todo maak setting
  totalVisists=0 //todo maak setting
  mailingRemembered=false
  batchesCopied_Idx: number[] = []

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
    for (let b of this.selectedEmails){
      result += b.emails.length
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
    for (let btype of this.bookTypes){
      checkboxes.addControl(btype, new FormControl(true));
    }
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
      
    this.selectedEmails = this._ds.searchEmails(this.visitedFrom,this.visitedUntil,
                                                this.mailedSinceFrom,this.totalVisists,
                                                this.selectedPropCodes, this.selectedBookTypes)
   // console.log(this.selectedEmails)
    }

  rememberMailing(){
    this.mailingRemembered=true
  }

  undoRememberMailing(){
    this.mailingRemembered=false
  }

  checkIfCopied(idx:number):boolean{ //for ngClass only
    //console.log('checkIfCopied. idx: ' + idx + ', ' + this.batchesCopied_Idx.includes(idx))
    return this.batchesCopied_Idx.includes(idx)
  }

  copyBatch(selectedEmail_Idx:number){
  
    let newVariable: any = window.navigator; //workaround 4 a typescript typings issue
    if (!this.batchesCopied_Idx.includes(selectedEmail_Idx)){ //toggle on
      let csv =''
      for (let e of this.selectedEmails[selectedEmail_Idx].emails){
        csv = csv + e  + ','
      }
      newVariable.clipboard.writeText(csv)
      //remember
      this.batchesCopied_Idx.push(selectedEmail_Idx)
    }
    else {//toggle off
      newVariable.clipboard.writeText('De emails moeten in het scherm doorgestreept zijn, alleen dan staan ze in het clipboard.')
      this.batchesCopied_Idx.splice(this.batchesCopied_Idx.indexOf(selectedEmail_Idx), 1)
    }
  }
}

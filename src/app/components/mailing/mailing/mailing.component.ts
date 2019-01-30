import { Component, OnInit } from '@angular/core';
import { EmailBatch } from 'src/app/models/emailbatch.model';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from 'src/app/services/data.service';
import { UIService } from 'src/app/services/ui.service';

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
  propTypes = ['app','huis']
  bookTypes = ['week','midweek','weekend']
  selectedPropTypes: Array<string> = []
  selectedBookTypes: Array<string> = []
  visitedSinceFrom=24 //todo maak setting
  visitedSinceUntil=0 //todo maak setting
  mailedSinceFrom=0  //todo maak setting
  mailedSinceUntil=0 //todo maak setting
  mailingRemembered=false
  batchesCopied_Idx: number[] = []
  ngOnInit() {
    this.initForm()
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
      'visitedSinceFrom': new FormControl(this.visitedSinceFrom,[Validators.required, Validators.pattern(/[1-9][0-9]*/)]), 
      'visitedSinceUntil': new FormControl(this.visitedSinceUntil>0?this.visitedSinceUntil:undefined,[Validators.pattern(/[1-9][0-9]*/)]), 
      'mailedSinceFrom': new FormControl(this.mailedSinceFrom>0?this.mailedSinceFrom:undefined,[Validators.pattern(/[1-9][0-9]*/)]), 
      'mailedSinceUntil': new FormControl(this.mailedSinceUntil>0?this.mailedSinceUntil:undefined,[Validators.pattern(/[1-9][0-9]*/)]), 
      'propType': new FormControl('',[Validators.required]),
      'bookTypeCheckboxes': new FormGroup({
       
      }),
    })
    //add checkbox dynamically, Angular 6 
    const checkboxes = <FormGroup>this.reactiveForm.get('bookTypeCheckboxes');
    for (let btype of this.bookTypes){
      checkboxes.addControl(btype, new FormControl(btype));
    }
  }
  screen2PropCodes(screenSelection:string){
    return screenSelection=='app' ? ['app']:['jvg', 'alb']
  }
  
  setSelectedBooktypes(checkboxes:FormGroup){
    this.selectedBookTypes.length=0
    this.bookTypes.map((booktype, i)=>{
      if (checkboxes.get(booktype).value) this.selectedBookTypes.push(booktype)
    })
  }

  onSubmit(){
    this.visitedSinceFrom = this.reactiveForm.get('visitedSinceFrom').value;
    this.visitedSinceUntil = this.reactiveForm.get('visitedSinceUntil').value;
    this.mailedSinceFrom = this.reactiveForm.get('mailedSinceFrom').value;
    this.mailedSinceUntil = this.reactiveForm.get('mailedSinceUntil').value;
    this.selectedPropTypes = this.screen2PropCodes(this.reactiveForm.get('propType').value )
    this.setSelectedBooktypes(<FormGroup>this.reactiveForm.get('bookTypeCheckboxes'))
    console.log(this.selectedBookTypes)
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
    //workaround 4 a typescript typings issue
    let newVariable: any = window.navigator; 
    //this is toggle functionality
    if (!this.batchesCopied_Idx.includes(selectedEmail_Idx)){ //toggle on
      //actual copy
      let csv =''
      for (let e of this.selectedEmails[selectedEmail_Idx].emails){
        csv = csv + e  + ','
      }
      newVariable.clipboard.writeText(csv)
      //remember we copied
      this.batchesCopied_Idx.push(selectedEmail_Idx)
    }
    else {//toggle off
      newVariable.clipboard.writeText('De emails moeten in het scherm doorgestreept zijn, alleen dan staan ze in het clipboard.')
      this.batchesCopied_Idx.splice(this.batchesCopied_Idx.indexOf(selectedEmail_Idx), 1)
    }
  }
}

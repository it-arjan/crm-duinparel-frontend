import { Component, OnInit } from '@angular/core';
import { EmailBatch } from 'src/app/models/emailbatch.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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
  selectedPropType: string
  selectedBookTypes: Array<string> = []
  visitedSinceFrom=24 //todo maak setting
  visitedSinceUntil=0 //todo maak setting
  mailedSinceFrom=0  //todo maak setting
  mailedSinceUntil=0 //todo maak setting
  mailingRemebered=false
  batchesCopied_Idx: number[] = []
  ngOnInit() {
    this.initForm()
  }
  countSelectedEmails(){
    return 45
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
  
  onSubmit(){
    this.visitedSinceFrom = this.reactiveForm.get('visitedSinceFrom').value;
    this.visitedSinceUntil = this.reactiveForm.get('visitedSinceUntil').value;
    this.mailedSinceFrom = this.reactiveForm.get('mailedSinceFrom').value;
    this.mailedSinceUntil = this.reactiveForm.get('mailedSinceUntil').value;
    this.selectedPropType = this.reactiveForm.get('propType').value;
    
    this.selectedBookTypes.length=0
    for (let btype of this.bookTypes){
      let val= this.reactiveForm.get('bookTypeCheckboxes').get(btype).value
      if (val) this.selectedBookTypes.push(val)
     }

    this.selectedEmails =
      this._ds.selectMailing(this.visitedSinceFrom, this.visitedSinceUntil, 
                            this.mailedSinceFrom, this.mailedSinceUntil, 
                            this.selectedPropType, this.selectedBookTypes)
    console.log( this.selectedEmails)
  }
  rememberMailing(){
    this.mailingRemebered=true
  }

  undoRememberMailing(){
    this.mailingRemebered=false
  }
  checkIfCopied(idx:number):boolean{ //for ngClass only
    //console.log('checkIfCopied. idx: ' + idx + ', ' + this.batchesCopied_Idx.includes(idx))
    return this.batchesCopied_Idx.includes(idx)
  }
  copyBatch(idx:number){
    let newVariable: any = window.navigator; 
    if (!this.batchesCopied_Idx.includes(idx)){
      this.batchesCopied_Idx.push(idx)
      //work around typescript typings issue
      let csv =''
      for (let e of this.selectedEmails[idx].emails){
        csv = csv + e  + ','
      }
      newVariable.clipboard.writeText(csv)
    }
    else{
      newVariable.clipboard.writeText('De emails moeten in het scherm doorgestreept zijn, dan staan ze in het clipboard.')
      this.batchesCopied_Idx.splice(idx, 1)
    }
  }
}

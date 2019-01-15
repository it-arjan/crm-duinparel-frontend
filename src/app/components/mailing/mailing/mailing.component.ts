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
    ) {}

  selectedEmails :EmailBatch[]
  reactiveForm: FormGroup;
  propTypes = ['app','huis']
  selectedPropType: string
  visitedSince=24 //todo maak setting
  mailedSince=6 //todo maak setting
  mailingRemebered=false
  batchesCopied_Idx: number[] = []
  ngOnInit() {
    this.initForm()
    }

  initForm(){
    this.reactiveForm = new FormGroup({
      'notVisitedSince': new FormControl(this.visitedSince,[Validators.required, Validators.pattern(/[1-9][0-9]*/)]), 
      'notMailedSince': new FormControl(this.mailedSince,[Validators.required, Validators.pattern(/[1-9][0-9]*/)]), 
     'propType': new FormControl('',[Validators.required]),
    })
  }
  
  onSubmit(){
    this.visitedSince = this.reactiveForm.get('notVisitedSince').value;
    this.mailedSince = this.reactiveForm.get('notMailedSince').value;
    this.selectedPropType = this.reactiveForm.get('propType').value;
    this.selectedEmails =this._ds.selectMailing(this.visitedSince,this.mailedSince, this.selectedPropType)
    console.log( this.selectedEmails)
  }
  rememberMailing(){
    this.mailingRemebered=true
  }

  undoRememberMailing(){
    this.mailingRemebered=false
  }
  checkIfCopied(idx:number):boolean{
    console.log('idx: ' + idx + ', ' + this.batchesCopied_Idx.includes(idx))
    return this.batchesCopied_Idx.includes(idx)
  }
  copyBatch(idx:number){
    if (!this.batchesCopied_Idx.includes(idx))
      this.batchesCopied_Idx.push(idx)
    console.log(this.batchesCopied_Idx)
  }
}

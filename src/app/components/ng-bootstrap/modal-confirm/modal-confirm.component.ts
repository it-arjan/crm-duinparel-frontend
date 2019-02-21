import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-confirm',
  template: `
  <div class="modal-header">
    <h4 class="modal-title" id="modal-title">{{title}}</h4>
    <button type="button" class="close" aria-label="Close button" aria-describedby="modal-title" (click)="modal.dismiss('Cross click')">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
  <div class="modal-body">
    <p><strong>{{message}} <span class="text-primary">{{messageHighlighted}}</span>?</strong></p>
    <p><span class="text-danger">NB: Dit is definitief.</span>
    </p>
  </div>
  <div class="modal-footer">
    <button type="button" class="btn btn-outline-secondary" (click)="modal.dismiss('cancel click')">Nee</button>
    <button type="button" ngbAutofocus class="btn btn-outline-danger" (click)="modal.close('Ok click')">Doen</button>
  </div>
  `,
  styles: ['']
})
export class ModalConfirmComponent implements OnInit {

  constructor(public modal: NgbActiveModal) { }
  @Input() public title:string;
  @Input() public message:string;
  @Input() public messageHighlighted:string;

  ngOnInit() {
  }

}

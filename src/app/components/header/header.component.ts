import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { UIService } from 'src/app/services/ui.service';
import { UserFeedback } from 'src/app/models/UserFeedback.model';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { IconFeedabck } from 'src/app/models/icon-feedback';
import { MessageFeedabck } from 'src/app/models/message-feedback';
import { ElectronService } from 'ngx-electron';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '../ng-bootstrap/modal-confirm/modal-confirm.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  animations: [
    // the fade-in/fade-out animation.
    trigger('feedbackAnimation', [
      state('in', style({opacity: 1})),
      state('out', style({opacity: 0})),
      transition('in =>out',animate('5000ms')),
      transition('out =>in',animate('1ms')),
    ])
  ]})
export class HeaderComponentComponent implements OnInit, OnDestroy {

  constructor(
    private _ui : UIService, 
    private _modalService: NgbModal,
    private _es: ElectronService
    ) { }
  notificationState:string;
  iconFeedback:IconFeedabck;
  msgFeedback:MessageFeedabck;
  msgType:string;
  UserFeedback:string;

  ngOnInit() {
    this._ui.notifications().subscribe((msg:UserFeedback)=>{
      this.notificationState = 'in'
      this.processFeedback(msg)
      //Trigger state change after view is rendered
      setTimeout(()=>{ this.notificationState = 'out' },2000)
    })
  }
  ngOnDestroy(){
    this._ui.notifications().unsubscribe()
  }
  processFeedback(feedback:UserFeedback){
    switch (feedback.type){
      case 'Removed':
      case 'Cancelled':
      case 'Success': 
        this.iconFeedback=new IconFeedabck(feedback.type);
        this.msgFeedback=undefined
        break;
      case 'Info':
        this.msgFeedback=new MessageFeedabck('info',feedback.message);
        this.iconFeedback=undefined
        break;
      case 'Warn':
        this.msgFeedback=new MessageFeedabck('warning ',feedback.message);
        this.iconFeedback=undefined
        break;
      case 'Error': 
        this.msgFeedback=new MessageFeedabck('danger',feedback.message);
        this.iconFeedback=undefined
        break;
    }

    this.UserFeedback=feedback.message
    this.msgType=feedback.type
    // console.log(this.msgType)
    // console.log('iconFeedback: '+this.iconFeedback)
    // console.log('msgFeedback: '+this.msgFeedback)
  }
  exitElectron(){
    const modalRef = this._modalService.open(ModalConfirmComponent);
    modalRef.componentInstance.title = 'Programma afsluiten';
    modalRef.componentInstance.message = 'Programma afsluiten?';
    modalRef.result
    .then(()=>{
      this._es.ipcRenderer.send('ExitProgram') //todo make method
    })
    .catch(()=>{
      console.log('modal cancelled')
    })  
  }
}

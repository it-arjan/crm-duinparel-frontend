import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { UIService } from 'src/app/services/ui.service';
import { UserFeedback } from 'src/app/models/UserFeedback.model';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

import { IconFeedback } from 'src/app/models/icon-feedback';
import { MessageFeedback } from 'src/app/models/message-feedback';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '../ng-bootstrap/modal-confirm/modal-confirm.component';
import { take } from 'rxjs/operators';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';

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
    private _ui : UIService, private _modalService: NgbModal,
    private _bs: BackendService,
    private _ds: DataService, private _router: Router
    ) { }
  notificationState:string;

  iconFeedback:IconFeedback;
  showIconFeedback: boolean
  
  msgFeedback:MessageFeedback;
  showMsgFeedback: boolean
  msgType:string;
  
  ngOnInit() {
    console.log('ngOnInit ')
    this._ui.notifier()
      .subscribe((msg:UserFeedback)=>{
        this.notificationState = 'in'
        this.processFeedback(msg)
        //Trigger state change after view is rendered
        setTimeout(()=>{ this.notificationState = 'out' },1000)
    })

    //TODO messages doesn't display
    //something seems to freeze in angular change detection
    this._ds.dataReadyReplay().pipe(take(1)) //auto-unsubscribe
      .subscribe((result)=>{
          if (result.error) { 
              console.log('Fout bij ophalen data!' + result.error)
              console.log(result)
              this._ui.error('Fout bij ophalen data: '+ result.error )// 
          } else {
            this._ui.info('de database is beschikbaar' )
            console.log('HeaderComponentComponent: data ophalen success!')
          }
    })    
  }
  // ngDoCheck(){
  //   console.log('=-=-=-=-=-=-=-=-=-=-=- DoCheck EXPENSIVE change detection in header  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-')
  //   console.log()
  // }
  ngOnDestroy(){
    this._ui.notifier().unsubscribe()
    //this._ds.dataReady().unsubscribe()
  }

  processFeedback(feedback:UserFeedback){
    switch (feedback.type){
      case 'Removed':
      case 'Cancelled':
      case 'Success': 
        this.showIconFeedback=true
        this.showMsgFeedback=false
        this.iconFeedback=new IconFeedback(feedback.type);
        break;
      case 'Info':
        this.showIconFeedback=false
        this.showMsgFeedback=true
        this.msgFeedback=new MessageFeedback('info',feedback.message);
        break;
      case 'Warn':
        this.showIconFeedback=false
        this.showMsgFeedback=true
        this.msgFeedback=new MessageFeedback('warning ',feedback.message);
        break;
      case 'Error': 
        this.showIconFeedback=false
        this.showMsgFeedback=true
        this.msgFeedback=new MessageFeedback('danger',feedback.message);
        break;
    }

    // this.UserFeedback=feedback.message
    // this.msgType=feedback.type
    // // console.log(this.msgType)
    // console.log('iconFeedback: '+this.iconFeedback)
    // console.log('msgFeedback: '+this.msgFeedback)
  }
  exitElectron(){ //todo make method on service 
    const modalRef = this._modalService.open(ModalConfirmComponent);
    modalRef.componentInstance.title = 'Programma afsluiten';
    modalRef.componentInstance.message = 'Programma afsluiten?';
    modalRef.result
    .then(()=>{
      this._bs.exitProgram() 
    })
    .catch(()=>{
      console.log('modal cancelled')
    })  
  }
}

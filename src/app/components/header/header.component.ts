import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { UIService } from 'src/app/services/ui.service';
import { UserFeedback } from 'src/app/models/UserFeedback.model';
import {trigger, state, style, animate, transition} from '@angular/animations';
import { IconFeedback } from 'src/app/models/icon-feedback';
import { MessageFeedback } from 'src/app/models/message-feedback';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '../ng-bootstrap/modal-confirm/modal-confirm.component';
import { take } from 'rxjs/operators';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import { tDataResult } from 'src/app/services/interfaces.persist';
import { AuthService } from 'src/app/services/auth.service';
import { FakeBackendService } from 'src/app/services/fake.data.backend.service';
import { ufType } from 'src/app/services/interfaces.ui';

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
    private _bs: FakeBackendService, private _cd: ChangeDetectorRef,
    private _auth: FakeBackendService,
    private _ds: DataService, private _r2: Renderer2
    ) { }
  notificationState:string

  currentFeedback:UserFeedback
  showAsIcon: boolean
  showAsMsg: boolean

  ufList:UserFeedback[]=[]
  @ViewChild('notifications') notifRef: ElementRef
  notifClicked=false

  resetAnimation(){
     this.notificationState = 'in'
     setTimeout(()=>{ this.notificationState = 'out' },1000)
  }

  ngOnInit() {
    console.log('ngOnInit ')
    this._ui.notifier()
      .subscribe((feedback:UserFeedback)=>{
        if (this._auth.isAuthenticated) this.onUINotification(feedback)
    })

    this._ds.dataReadyReplay().pipe(take(1)) //auto-unsubscribe
      .subscribe((result)=>{
        this.onDataReady(result)
    })    
  }

  onUINotification(feedback:UserFeedback){
      this.notificationState = 'in'
      this.currentFeedback=feedback
      //this.processFeedback(feedback)
      // Start adding warnings/ errors to history after logon
      if (feedback.toHistory()) {
        this.ufList.unshift(feedback) 
      }
            //Trigger state change after view is rendered
      setTimeout(()=>{ this.notificationState = 'out' },1000)
      this._cd.detectChanges() //hack to pickup the first message
  }

  onClickNotifications(){
    this.notifClicked=!this.notifClicked

    let action = this.notifClicked ? 'block': 'none'
    console.log('action='+action)
    //this._r2[action](this.notifRef.nativeElement, 'open-notifications')
    this._r2.setStyle(this.notifRef.nativeElement,'display', action)
  }
  
  onDataReady(result: tDataResult){
    if (result.error) { 
        console.log('Fout bij ophalen data!' + result.error)
        console.log(result)
        this._ui.error('Fout bij ophalen data: '+ result.error )// 
    } else {
      //this._ui.info('de database is beschikbaar' )
      console.log('handleDataReady: data ophalen success!')
    }
  }
  // ngDoCheck(){
  //   console.log('=-=-=-=-=-=-=-=-=-=-=- DoCheck EXPENSIVE change detection in header  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-')
  //   console.log()
  // }
  ngOnDestroy() {
    this._ui.notifier().unsubscribe()
    //this._ds.dataReady().unsubscribe()
  }

  // processFeedback(feedback:UserFeedback){
  //   switch (feedback.type){
  //     case ufType.iconRemoved:
  //     case ufType.iconCancelled:
  //     case ufType.iconSuccess: 
  //       this.showAsIcon=true
  //       this.showAsMsg=false
  //       break;
  //     case ufType.msgInfo:
  //       this.showAsIcon=false
  //       this.showAsMsg=true
  //       break;
  //     case ufType.msgWarn:
  //       this.showAsIcon=false
  //       this.showAsMsg=true
  //       break;
  //     case ufType.msgError: 
  //       this.showAsIcon=false
  //       this.showAsMsg=true
  //       break;
  //   }
  // }

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

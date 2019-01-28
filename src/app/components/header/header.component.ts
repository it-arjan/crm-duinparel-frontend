import { Component, OnInit, AfterViewInit, AfterViewChecked } from '@angular/core';
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
export class HeaderComponentComponent implements OnInit {

  constructor(private _ui : UIService) { }
  notificationState:string;
  iconFeedback:IconFeedabck;
  msgFeedback:MessageFeedabck;
  msgType:string;
  UserFeedback:string;

  ngOnInit() {
    this._ui.notifyHelper.subscribe((msg:UserFeedback)=>{
      this.notificationState = 'in'
      this.processFeedback(msg)
      //Trigger state change after view is rendered
      setTimeout(()=>{ this.notificationState = 'out' },2000)
    })
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
    console.log(this.msgType)
    console.log('iconFeedback: '+this.iconFeedback)
    console.log('msgFeedback: '+this.msgFeedback)
  }

}

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UserFeedback } from '../models/UserFeedback.model';
import { tGuistate, tGuiguidance, tComponentNames, iGuidance } from './interfaces.ui';

@Injectable({
  providedIn: 'root'
})


export class UIService implements iGuidance{
  private naviSender:Subject<tGuiguidance> = new Subject<tGuiguidance>();
  private notifySender:Subject<UserFeedback> = new Subject<UserFeedback>();
  private naviListener:Subject<tGuistate> = new Subject<tGuistate>();

  constructor() { 
    this.naviListener.subscribe((guistate:tGuistate)=>{
      //add logic
      let guidance = this.createGuidance(guistate)
      console.log('sending guidance')
      this.naviSender.next(guidance )
    })
  }
  createGuidance(state:tGuistate):tGuiguidance{
    let result:tGuiguidance
    switch (state){
      case tGuistate.searchCustomer: 
        result= {
          timeToGo: [tComponentNames.newEditCustomer,tComponentNames.listBooking ],
          wakeUp: [tComponentNames.listCustomer]
        }
        break;
      case tGuistate.editCustomer: 
      case tGuistate.newCustomer: 
      case tGuistate.bookingsOfCustomer: 
        result= {
          timeToGo: [],
          wakeUp: [tComponentNames.newEditCustomer,tComponentNames.listBooking ]
        }
        break;
      default: result= {
        timeToGo: [],
        wakeUp: []
      }
    }//case
    return result
  }
  guider(): Subject<tGuiguidance> {
    console.log("guidance: subscriber request")
    return this.naviSender
  }
  notify(state:tGuistate) {
    console.log("notified: "+tGuistate[state])
    this.naviListener.next(state)
  }
  
  notifier():Subject<UserFeedback> {
    return this.notifySender
  }
  

  deletedIcon(){
    this.notifySender.next(new UserFeedback('Removed', null))
  }
  cancelledIcon(){
    this.notifySender.next(new UserFeedback('Cancelled', null))
  }
  successIcon(){
    this.notifySender.next(new UserFeedback('Success', null))
  }
  info(msg:string){
    this.notifySender.next(new UserFeedback('Info', msg))
  }
  warning(msg:string){
    this.notifySender.next(new UserFeedback('Warn', msg))
  }
  error(msg:string){
    this.notifySender.next(new UserFeedback('Error', msg))
  }
}
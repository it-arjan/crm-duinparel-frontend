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
  private timeLastMsg= Date.now()
  
  private mininterval=1500

  msgHistory: UserFeedback[] =[]
  constructor() { 
    this.naviListener.subscribe((guistate:tGuistate)=>{
      //add logic
      let guidance = this.createGuidance(guistate) 
       
      console.log('sending guidance ')
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

  checkin(state:tGuistate) {
    console.log("notified: "+tGuistate[state])
    this.naviListener.next(state)
  }

  notifier():Subject<UserFeedback> {
    return this.notifySender
  }
  
  getMessageHistory(): UserFeedback[]{
    return this.msgHistory
  }
  
  nextNotification(feedback: UserFeedback){
     let interval =  Date.now() - this.timeLastMsg
      let timeout=interval > this.mininterval ? 0: this.mininterval - interval 
      this.timeLastMsg=Date.now()
    console.log("notfying after "+timeout)
      setTimeout(() => {
        this.notifySender.next(feedback)
      }, timeout);
      if (feedback.message)
        this.msgHistory.unshift(feedback)
  }
  deletedIcon(){
    this.nextNotification(new UserFeedback('Removed', null))
  }
  cancelledIcon(){
    this.nextNotification(new UserFeedback('Cancelled', null))
  }
  successIcon(){
    this.nextNotification(new UserFeedback('Success', null))
  }
  info(msg:string){
    this.nextNotification(new UserFeedback('Info', msg))
  }
  warning(msg:string){
    this.nextNotification(new UserFeedback('Warn', msg))
  }
  error(msg:string){
    this.nextNotification(new UserFeedback('Error', msg))
  }
}
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UserFeedback } from '../models/UserFeedback.model';
import { tGuistate, tGuiguidance, tComponentNames, iGuidance, ufType } from './interfaces.ui';
import { AuthBase } from './auth.base.service';


@Injectable({
  providedIn: 'root' 
})

export class UIService implements iGuidance {

  private naviSender:Subject<tGuiguidance> = new Subject<tGuiguidance>();
  private notifySender:Subject<UserFeedback> = new Subject<UserFeedback>();
  private naviListener:Subject<tGuistate> = new Subject<tGuistate>();
  private timeLastMsg= Date.now()
  
  private mininterval=1500

  feedbackHistory: UserFeedback[] =[]
  constructor(
    private _auth: AuthBase
  ) {
    this.listenForCheckins()
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

  listenForCheckins(){
    this.naviListener.subscribe((guistate:tGuistate)=>{
      if (this._auth.isAuthenticated()){
        let guidance = this.createGuidance(guistate) 
        
        console.log('sending guidance ')
        this.naviSender.next(guidance )  
      }
    })
  }

  checkin(state:tGuistate) {
    console.log("notified: "+tGuistate[state])
    this.naviListener.next(state)
  }

  notifier():Subject<UserFeedback> {
    return this.notifySender
  }
  
  ensureMinTimeInBetween(): number{
     let interval =  Date.now() - this.timeLastMsg
     let timeout=interval > this.mininterval ? 0: this.mininterval - interval 
     //keep admin asap
     this.timeLastMsg=Date.now() + timeout

     return timeout
  }

  nextNotification(feedback: UserFeedback){
    let timeout = this.ensureMinTimeInBetween()
    console.log("notfying after " + timeout)
    setTimeout(()=> this.notifySender.next(feedback), timeout)
  }

  deletedIcon(){
    this.nextNotification(new UserFeedback(ufType.iconRemoved, null))
  }
  cancelledIcon(){
    this.nextNotification(new UserFeedback(ufType.iconCancelled, null))
  }
  successIcon(){
    this.nextNotification(new UserFeedback(ufType.iconSuccess, null))
  }
  info(msg:string){
    this.nextNotification(new UserFeedback(ufType.msgInfo, msg))
  }
  warning(msg:string){
    this.nextNotification(new UserFeedback(ufType.msgWarn, msg))
  }
  error(msg:string){
    this.nextNotification(new UserFeedback(ufType.msgError, msg))
  }
}
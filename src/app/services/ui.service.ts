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
    let result:tGuiguidance = null;
    switch (state){
      case tGuistate.searchCustomerClick: 
        result= {
          hideList: [tComponentNames.newEditCustomer,tComponentNames.listBooking ],
          displayList: [tComponentNames.listCustomer],
          blurList: []
        }
        break;
      case tGuistate.newCustomerOpen: 
        result= {
          hideList: [tComponentNames.searchCustomer, tComponentNames.listCustomer],
          displayList: [tComponentNames.newEditCustomer ],
          blurList: [tComponentNames.header]
        }
        break;
      case tGuistate.bookingsOfCustomerClose: 
      case tGuistate.customerClose: 
        result= {
          hideList: [],
          displayList: [tComponentNames.searchCustomer, tComponentNames.header,tComponentNames.listCustomer ],
          blurList: []
        }
        break;
      case tGuistate.editCustomerOpen: 
      case tGuistate.bookingsOfCustomerOpen: 
        result= {
          hideList: [tComponentNames.searchCustomer],
          displayList: [tComponentNames.newEditCustomer,tComponentNames.listBooking ],
          blurList: [tComponentNames.header]
        }
        break;
      case tGuistate.bookingDataDirty: 
      case tGuistate.customerEditDataDirty: 
        result= {
          hideList: [],
          displayList: [],
          blurList: [tComponentNames.listCustomer]
        }
        break;
      case tGuistate.customerNewDataDirty: 
        result= {
          hideList: [],
          displayList: [],
          blurList: []
        }
        break;
        default: result= null
    }//case
    return result.hideList.length +result.displayList.length +result.blurList.length > 0 ? result: null
  }

  guider(): Subject<tGuiguidance> {
    console.log("guidance: subscriber request")
    return this.naviSender
  }

  listenForCheckins(){
    this.naviListener.subscribe((guistate:tGuistate)=>{
      if (this._auth.isAuthenticated()){
        let guidance = this.createGuidance(guistate) 
        
        if (guidance) {
          console.log('sending guidance ')
          this.naviSender.next(guidance ) 
        } 
      }
    })
  }

  checkin(state:tGuistate) {
    console.log("uiservice receives checkin "+tGuistate[state])
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
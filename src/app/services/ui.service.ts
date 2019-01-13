import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UserFeedback } from '../models/UserFeedback.model';

@Injectable({
  providedIn: 'root'
})
export class UIService {

  constructor() { }
  private naviHelper:Subject<string> = new Subject<string>();
  notifyHelper:Subject<UserFeedback> = new Subject<UserFeedback>();
  knownGuiStates = ['editCustomer', 'newCustomer', 'newBooking']
  emitGuiState(state:string){
    if (this.knownGuiStates.includes(state)){
      this.naviHelper.next(state)
    }
    else{
      this.error('unknown guistate: ' + state)
    }
  }
  broadCastRemoval(){
    this.notifyHelper.next(new UserFeedback('Removed', null))
  }
  cancelled(){
    this.notifyHelper.next(new UserFeedback('Cancelled', null))
  }
  success(){
    this.notifyHelper.next(new UserFeedback('Success', null))
  }
  info(msg:string){
    this.notifyHelper.next(new UserFeedback('Info', msg))
  }
  warning(msg:string){
    this.notifyHelper.next(new UserFeedback('Warn', msg))
  }
  error(msg:string){
    this.notifyHelper.next(new UserFeedback('Error', msg))
  }
}
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UIService {

  constructor() { }
  private naviHelper:Subject<string> = new Subject<string>();
  notifyHelper:Subject<{type:string, msg:string}> = new Subject<{type:string, msg:string}>();
  knownGuiCodes = ['editCustomer', 'newCustomer', 'newBooking']
  emitGuiState(code:string){
    if (this.knownGuiCodes.includes(code)){
      this.naviHelper.next(code)
    }
    else{
      this.Error('unknown guistate: ' + code)
    }
  }
  info(msg:string){
    this.notifyHelper.next({type:'Info', msg:msg})
  }
  Warning(msg:string){
    this.notifyHelper.next({type:'Warn', msg:msg})
  }
  Error(msg:string){
    this.notifyHelper.next({type:'Error', msg:msg})
  }
}
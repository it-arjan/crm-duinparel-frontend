import { Subject } from 'rxjs';

export enum tGuistate {searchCustomer, editCustomer,newCustomer, bookingsOfCustomer}
export enum tComponentNames {listCustomer, newEditCustomer, listBooking, searchMailing, showSettings}

export interface tGuiguidance {
  timeToGo: tComponentNames[]
  wakeUp: tComponentNames[]
}
export enum ufType {
  iconRemoved, iconCancelled, iconSuccess, msgInfo, msgWarn, msgError
}
export enum mfType {
  info, warning, danger
}
export interface iGuidance {

  guider(): Subject<tGuiguidance>
  checkin(state:tGuistate)
  notifier()
  //getMessageHistory()
  deletedIcon()
  cancelledIcon()
  successIcon()
  info(msg:string)
  warning(msg:string)
  error(msg:string)
}
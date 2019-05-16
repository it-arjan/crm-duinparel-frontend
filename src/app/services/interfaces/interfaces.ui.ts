import { Subject } from 'rxjs';

export enum tGuistate {searchCustomerClick, editCustomerOpen, editCustomerClose, newCustomerOpen, customerClose, bookingsOfCustomerOpen, bookingsOfCustomerClose, bookingDataDirty, customerNewDataDirty, customerEditDataDirty}
export enum tComponentNames {searchCustomer, listCustomer, newEditCustomer, listBooking, searchMailing, showSettings, header}

export interface tGuiguidance {
  hideList: tComponentNames[]
  displayList: tComponentNames[]
  blurList: tComponentNames[]
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
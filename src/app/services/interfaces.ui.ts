import { Subject } from 'rxjs';

export enum tGuistate {searchCustomer, editCustomer,newCustomer, bookingsOfCustomer}
export enum tComponentNames {listCustomer, newEditCustomer, listBooking, searchMailing, showSettings}

export interface tGuiguidance {
  timeToGo: tComponentNames[]
  wakeUp: tComponentNames[]
}
export interface iGuidance {
  notify(state:tGuistate)
  guidance(): Subject<tGuiguidance>
}
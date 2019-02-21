import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { tBulkdataResult, tDataResult, iDataPersist, tPersist, tDataResultNodejs, tPersistBag } from './interfaces.persist';
import { Customer } from '../models/customer.model';
import { ElectronService } from 'ngx-electron';
import { Mailing } from '../models/mailing.model';
import { Booking } from '../models/booking.model';
import { UIService } from './ui.service';

@Injectable({
  providedIn: 'root'
})
export class PersistService  implements iDataPersist {

  constructor(
    private _es: ElectronService,
     private _ui: UIService,
 ) { }
  private getData_R$ : ReplaySubject<tBulkdataResult>
  private persistCust_R$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
  private persistBook_R$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
  private persistMail_R$: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()

  //////////////////////////////////
  // ====== iDataPersist
  //////////////////////////
  checkPlatform(){
    if(!this._es.isElectronApp) {
      throw new Error('NodeJs cann only be approached in electron app.')
    }
  }
    getData(): ReplaySubject<tBulkdataResult> {
    this.checkPlatform();
    this.getData_R$ = new ReplaySubject<tBulkdataResult>(1);
    this._es.ipcRenderer.once('GetDataResponse', 
      (event: Electron.IpcMessageEvent, data: tBulkdataResult) => {
        console.log("GetDataResponse!!!")
        
        //convert it
        let angcustomers = data.customers.map(jsCust => {
          let angCust = Customer.consumejsCustomerDeep(jsCust)
          return angCust
        })
        let angmailings = data.mailings.map(jsmail => {
          let angmail = Mailing.consumeJsMailing(jsmail)
          return angmail
        })        
        let angResult:tBulkdataResult ={customers:null, mailings:null, error:null}
        
        angResult.customers = angcustomers
        angResult.mailings = angmailings
        // backend call always succeeds, error holds the errors
        angResult.error = data.error

        this.getData_R$.next(angResult)
    })
    this._es.ipcRenderer.send('GetData')
    return this.getData_R$
  }

  cleanupDataCache() {
    this.getData_R$.complete()
    this.getData_R$= new ReplaySubject<tBulkdataResult>()
  }
  
  persist(object: Customer | Booking |Mailing, persisttype: tPersist) : ReplaySubject<tDataResult>{
    this.checkPlatform();

    let objecttype = object.constructor.name

    let subject = objecttype ==='Customer' 
      ? this.persistCust_R$ 
      :objecttype ==='Booking' 
        ?this.persistBook_R$ 
        :objecttype ==='Mailing' 
        ?this.persistMail_R$ 
      :null 
    
    if (!subject){
      this._ui.error(`invalid objecttype ${objecttype} for operation ${tPersist[persisttype]}. Dit is niet goed`!!)
      return
    }
    let returnChannelName = `Persist${objecttype}Response`
    this._es.ipcRenderer.once(returnChannelName, (event: Electron.IpcMessageEvent, result: tDataResultNodejs) => {
      console.log(returnChannelName + '!!');
      if (persisttype === tPersist.Insert) {
        object.id= result.generatedid
      }
      subject.next(result)
    })
    //call to ipcMain
    let sendarg : tPersistBag = {objecttype: objecttype, object: object, persisttype:tPersist[persisttype]}
    this._es.ipcRenderer.send('Persist', sendarg)

    return subject
  }

  persistCustomer(customer: Customer, type: tPersist) :  ReplaySubject<tDataResult> {
    return this.persist(customer, type)
  }

  persistBooking(booking:Booking, type: tPersist): ReplaySubject<tDataResult>{
    return this.persist(booking, type)
 }
 
  persistMailing(mailing: Mailing, type: tPersist) : ReplaySubject<tDataResult>{
    return this.persist(mailing, type)
  }  
}

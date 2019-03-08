import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { tBulkdataResult, tDataResult, iDataPersist, tPersist, tDataResultNodejs, tPersistBag } from './interfaces.persist';
import { Customer } from '../models/customer.model';
import { ElectronService } from 'ngx-electron';
import { Mailing } from '../models/mailing.model';
import { Booking } from '../models/booking.model';
import { UIService } from './ui.service';
import { PersistBase } from './persist.base.service';

@Injectable()
export class PersistService extends PersistBase {

  constructor(
    private _es: ElectronService,
    private _ui: UIService) { 
    super()
    this.subscribeToFallbackChannel()
 }
    
  private getData_R$ : ReplaySubject<tBulkdataResult> =new ReplaySubject<tBulkdataResult>(1);

  subscribeToFallbackChannel(){
    if (this._es.ipcRenderer){
      this._es.ipcRenderer.on('FallbackChannel', 
          (event: Electron.IpcMessageEvent, data: tDataResult) => {
            this._ui.error("a message on the FallbackChannel is getting through, this is highly uncommon..")
            if (data.error) this._ui.error("...errors! " + data.error)
        }) 
    }
  }
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
    this._es.ipcRenderer.once('GetDataResponse', 
      (event: Electron.IpcMessageEvent, data: tBulkdataResult) => {
        console.log("GetDataResponse")
        if (data.error) console.log("...errors! " + data.error)
        //convert
        let angResult:tBulkdataResult = {
          customers: data.customers.map(jsCust => Customer.consumejsCustomerDeep(jsCust)), 
          mailings: data.mailings.map(jsmail => Mailing.consumeJsMailing(jsmail)), 
          error: data.error
        }
        this.getData_R$.next(angResult)
    })
    this._es.ipcRenderer.send('GetData')
    return this.getData_R$
  }

  cleanupDataCache() { //todo does this really save memory?
    this.getData_R$.complete()
    this.getData_R$= new ReplaySubject<tBulkdataResult>()
  }
  
  persist(objecttype: string, object: Customer | Booking |Mailing, persisttype: tPersist) : ReplaySubject<tDataResult>{
    this.checkPlatform();

    // below works in de, fails in prod
    // let objecttype = object.constructor.name
    // alert(objecttype)
    let subject: ReplaySubject<tDataResult> = new ReplaySubject<tDataResult>()
   
    let returnChannelName = `Persist${objecttype}Response`
    this._es.ipcRenderer.once(returnChannelName, (event: Electron.IpcMessageEvent, result: tDataResultNodejs) => {
      console.log('response from ' + returnChannelName + ' :)');
      if (persisttype === tPersist.Insert) {
        object.id= result.generatedid
      }
      subject.next(result)
    })
    //call to ipcMain
    let sendarg : tPersistBag = {objecttype: objecttype, object: object, persisttype:tPersist[persisttype]}
       console.log('sendig persist with');
       console.log(sendarg)
   this._es.ipcRenderer.send('Persist', sendarg)

    return subject
  }

  persistCustomer(customer: Customer, type: tPersist) :  ReplaySubject<tDataResult> {
    return this.persist("Customer", customer, type)
  }

  persistBooking(booking:Booking, type: tPersist): ReplaySubject<tDataResult>{
    return this.persist("Booking", booking, type)
 }
 
  persistMailing(mailing: Mailing, type: tPersist) : ReplaySubject<tDataResult>{
    return this.persist("Mailing", mailing, type)
  }  
}

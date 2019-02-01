import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ConfigSetting } from '../models/configsetting.model';
import { UIService } from './ui.service';
import { Customer } from '../models/customer.model';
import { Booking } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor(
    private _es: ElectronService,
    private _ui: UIService,
    ) { }

  settings: ConfigSetting[];
  userPassword: string

  readConfig(){
    //subscribe
    console.log('subscribe to ReadConfigResponse')
    this._es.ipcRenderer.once('ReadConfigResponse', (event: Electron.IpcMessageEvent, arg: ConfigSetting[]) => {
      //console.log('ReadConfigResponse!!');
      this.settings=arg;
      this.settings.forEach((confSetting:ConfigSetting)=>{
        console.log(confSetting.name + ', ', confSetting.value)
      })
  });

  //console.log('send ReadConfig event to ipcMain..')
  this._es.ipcRenderer.send('ReadConfig')
  }
test(){
  this._es.ipcRenderer.once('TestResponse', (event: Electron.IpcMessageEvent, result: Customer) => {
    console.log('TestResponse!!');
    console.log(result)
    let x:Customer = new Customer(result.id, result.name, result.address,result.email, result.iban, new Array<Booking>())
    result.bookings.forEach((bt:Booking)=>{
      x.consumeBookingClone(bt)
    })
    console.log(x)
    x.test()
  })
  this._es.ipcRenderer.send('Test')
}
  writeConfig(){
    //subscribe
    console.log('subscribe to WriteConfigResponse')
    this._es.ipcRenderer.once('WriteConfigResponse', (event: Electron.IpcMessageEvent, result: string) => {
      console.log('WriteConfigResponse!!');
      if (result === 'success') 
      {
        console.log('WriteConfigResponse :: SUCCESS');
        this._ui.success()
      }
      else this._ui.error("Error writing config: " + result)
  });  
  
  //console.log('send WriteConfig event to ipcMain..')
  this.settings[0].value='changed'
  this._es.ipcRenderer.send('WriteConfig', this.settings)
}

changePassword(){
  console.log('subscribe to ChangepasswordResponse')
  this._es.ipcRenderer.once('RecryptDbSecretResponse', (event: Electron.IpcMessageEvent, result: string) => {
    console.log('RecryptDbSecretResponse!!');
    if (result === 'success') 
    {
      this._ui.success()
    }
    else this._ui.error("Error writing config: " + result)
  });  

  //console.log('send RecryptDbSecret event to ipcMain..')
  //this.settings[0].value='changed'
  let pwds = {oldpass:'initial', newpass:'initial2'}
  this._es.ipcRenderer.send('RecryptDbSecret', pwds)
}
}

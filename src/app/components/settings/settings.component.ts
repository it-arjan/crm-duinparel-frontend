import { Component, OnInit, ViewChild, AfterViewInit, OnChanges, NgZone } from '@angular/core';
import { BackendBase } from 'src/app/services/base/backend.base.service';
import { ConfigSetting } from 'src/app/models/configsetting.model';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { UIService } from 'src/app/services/ui.service';
import { LogEntry } from 'src/app/models/logentry.model';
import { Globals } from 'src/app/shared/globals';
import { DataService } from 'src/app/services/data.service';
import { ReplaySubject } from 'rxjs';
import { tDataResult } from 'src/app/services/interfaces/interfaces.persist';
import { Router } from '@angular/router';
import { AuthBase } from 'src/app/services/base/auth.base.service';
import * as Papa from 'papaparse/papaparse.min.js';
import { Customer } from 'src/app/models/customer.model';
import { Booking } from 'src/app/models/booking.model';

import * as moment from 'moment';
import 'moment/locale/nl'  // without this line it didn't work
moment.locale('nl')

@Component({
  selector: 'app-config',
  templateUrl: './settings.component.html',
  styles: [`

  `]
})
export class SettingsComponent implements OnInit {

  constructor(private _bs : BackendBase,
              private _auth: AuthBase,
              private _router: Router, private ngZone: NgZone,
              private _ui: UIService) { 
  }
  settings: ConfigSetting[]=[];
  logonForm: FormGroup
  changePwdForm: FormGroup
  csvForm: FormGroup
  loggedOn = false //get from route?@!??!
  changepwdClicked=false
  capsLock=false
  logEntries: Array<LogEntry>=[]
  tabIds=['logon','changepwd', 'settings','logs']
  activetabNr=0
  activetabId='logon'
  getdataSubs: ReplaySubject<tDataResult>
  //@ViewChild('tabset') tabset
  importedCustomers: Customer[]=[]
  ngOnInit() {
    this.initForms()
    this.readConfig()
    this.loggedOn = this._auth.isAuthenticated()
    this.setActiveTabNr()
  }

  getActiveTabID(){
    // if (this.activetabNr > this.tabIds.length -1)
    //   this._ui.error(`kan active tab ${this.activetabNr} niet automatisch selecteren, klik zelf even of start opnieuw op.`)
    return this.tabIds[this.activetabNr]
  }

  public navigate(commands: any[]): void {
      this.ngZone.run(() => this._router.navigate(commands)).then();
  }
  
  checkSettings():boolean{
    let settingWithError:string
    if ( settingWithError = this.searchIncorrectSetting()) {
      this._ui.error(`Sommige instellingen (${settingWithError}) zijn niet goed, aub eerst corrigeren en dan pas inloggen. Klik de instellingen tab`)
    }
    return settingWithError === undefined
  }

  setActiveTabNr(){
    if (!this.checkSettings()) this.activetabNr=2
    else if (!this._auth.isAuthenticated()) this.activetabNr=0
    else this.activetabNr=2

    this.activetabId = this.getActiveTabID()
    console.log('setActiveTab sets ' +this.activetabId)
  }

  searchIncorrectSetting(): string {
    console.log('searchIncorrectSetting')
    for (let setting of this.settings){
      if (setting.error)  {
        //console.log('Found Error setting: ' + setting.name)
        return setting.name
      }
    }
    return undefined;
  }

  initForms(){
    this.logonForm = new FormGroup({
      'password': new FormControl('',[Validators.required])        
    })
    this.changePwdForm = new FormGroup({
      'oldpassword': new FormControl('',[Validators.required]),
      'newpassword': new FormControl('',[Validators.required]),       
      'newpassword2': new FormControl('',[Validators.required]),       
    })
   this.csvForm = new FormGroup({
      'csvFile': new FormControl(null,[Validators.required])
    })
  }
  
  onCsvUpload(event){
    let reader = new FileReader()
    reader.onload = () => {
      console.log('file loaded!');
      this.csvToCustomers(reader.result);
    }
    console.log(event.target.files[0])
    reader.readAsText(event.target.files[0])
  }
  getBooktype(arrive: number,depart:number){
    return 'Week'
  }
  csvToCustomers(csv){
    var result = Papa.parse(csv, {header: true});
    console.log(result)
    this.importedCustomers.length=0
    let cust:Customer
    let book:Booking
    for (let row of result.data){
      if (row.Aankomst){
        //booking
        let arrive = moment(row.Aankomst, "DD-MM-YYYY").unix() * 1000
        let depart = moment(row.Vertrek, "DD-MM-YYYY").unix() * 1000 
        let appcode = row.Huis
        let booktype=this.getBooktype(arrive, depart)
        book=new Booking(-1, -1, arrive, depart,2, appcode, booktype)
        cust.bookings.push(book)
      }
      else if (row.Email){
        //customer
        let name =row.Naam
        let address =row.Adres
        let email =row.Email
        let country =row.Land
        cust= new Customer(-1, name, address, email, '',country,[])
        this.importedCustomers.push(cust)
      }
    }
  }
  
  onLogon(){
    console.log('onLogon')
    if (this.checkSettings()){
      this._auth.logOn(this.logonForm.get('password').value)
      .then(()=>{
        this.loggedOn =true
        this._auth.raiseAuthCompleted(true)
        this.logonForm.setValue({password:''})
        this.setActiveTabNr() 
        this._ui.successIcon()
        this.navigate(['/','booking'])
         
      })
      .catch((errmsg)=>{
        this.loggedOn =false
        this._ui.error("Inloggen niet gelukt: " + errmsg)
      })

    }
  }

  ngOnDestroy(){
  }
  
  globDateTime(){
    return Globals.angularDateTimeformat
  }
  
  getLogs(){
    console.log('call')
    this._bs.getLogs()
    .then((logArray)=>{
      console.log('call.then')
      console.log(logArray)
      this.logEntries.length=0
      logArray.forEach(x => this.logEntries.push(x))
    })
  }
  
  onChangePwd(){
    let oldpass=this.changePwdForm.get('oldpassword').value
      let newpwd1= this.changePwdForm.get('newpassword').value
      let newpwd2= this.changePwdForm.get('newpassword2').value
      
      this._auth.logOn(oldpass)
      .then(()=>{ //compare with pwd on file
        if (newpwd1.length < 6) this._ui.error("nieuw wachtwoord moet minimaal 6 karakters lang")
        else if (newpwd1 != newpwd2) this._ui.error("nieuwe wachtwoorden niet hetzelfde")
        else {
          this._auth.changePassword(oldpass, newpwd1)
          .then(()=>{
            this.changePwdForm.setValue({oldpassword:'', newpassword:'', newpassword2:''})
            this.setActiveTabNr()
            this._ui.successIcon()
          })
          .catch(x=> this._ui.error("Error writing config."))
        }
      })
      .catch(()=> this._ui.error("oude wachtwoord helaas niet goed"))
  }

  readConfig(){
    this.settings.length=0 //to trigger short screen feedback
    this._bs.readConfig()
      .then((result)=>{
        this.settings = result
        this.setActiveTabNr()
      })
  }

  writeConfig(){
    //this._cfg.changePassword();
    this._bs.writeConfig(this.settings)
  }

  checkCapslock(event){
    this.capsLock=event.getModifierState("CapsLock")
    if (this.capsLock){
      this._ui.error('Caps Lock is on!!')
    }
  }

  testUiBug(){
    this._ui.successIcon()
    setTimeout(() => {
    this._ui.info('deze melding zie ik ')
    }, 1000);
     setTimeout(() => {
    this._ui.error('deze melding zie ik ook!!!!')
    }, 2000);
  }

}

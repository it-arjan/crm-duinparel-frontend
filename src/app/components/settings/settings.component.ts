import { Component, OnInit, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { ConfigSetting } from 'src/app/models/configsetting.model';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { UIService } from 'src/app/services/ui.service';
import { LogEntry } from 'src/app/models/logentry.model';
import { Globals } from 'src/app/shared/globals';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-config',
  templateUrl: './settings.component.html',
  styles: [`

  `]
})
export class SettingsComponent implements OnInit {

  constructor(private _bs : BackendService, private _ds: DataService, private _ui: UIService) { 
  }
  settings: ConfigSetting[]=[];
  logonForm: FormGroup
  changePwdForm: FormGroup
  loggedOn = false //get from route?@!??!
  changepwdClicked=false
  capsLock=false
  logEntries: Array<LogEntry>=[]

  //@ViewChild('tabset') tabset

  ngOnInit() {
     console.log(`ngOnInit  - active tab is ${this.activetabNr}`);
  this.initForms()
  this.readConfig()
  }
  tabs=['logon','changepwd', 'settings','logs']
  activetabNr

  getActiveTabID(activetabNr){
    if (activetabNr > this.tabs.length -1)
      this._ui.error(`kan active tab nr ${activetabNr} niet automatisch selecteren, klik zelf even of start opnieuw op.`)
    return this.tabs[activetabNr]
  }

  setActiveTabNr(){
    let name
    if ( name = this.searchIncorrectSetting()) {
      this._ui.error(`Some settings (${name}) show errors, please correct them before logging on`)
      this.activetabNr=2
    }
    else if (!this.loggedOn) this.activetabNr=0
    else this.activetabNr=2

    console.log('setActiveTabNr() ' +this.activetabNr)
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
  }
 
  onLogon(){
    this._bs.logOn(this.logonForm.get('password').value)
    .then(()=>{
      this.loggedOn =true
      this._ds.getData()

      this.logonForm.setValue({password:''})
      this.setActiveTabNr()
      this._ui.success()
    })
    .catch((err)=>{
      this.loggedOn =false
      this._ui.error("password incorrect")
    })
  }

  globDateformat(){
    return Globals.angularDateformat
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
      let new1= this.changePwdForm.get('newpassword').value
      let new2= this.changePwdForm.get('newpassword2').value
      
      this._bs.logOn(oldpass).then(()=>{ //compare with pwd on file
        if (new1.length < 6) this._ui.error("nieuw wachtwoord moet minimaal 6 karakters lang")
        else if (new1 != new2) this._ui.error("nieuwe wachtwoorden niet hetzelfde")
        else {
          this._bs.changePassword(oldpass, new1)
          .then(()=>{
            this.changePwdForm.setValue({oldpassword:'', newpassword:'', newpassword2:''})
            this.setActiveTabNr()
            this._ui.success()
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
onTestDb(){
  this._bs.testDb()
}
  checkCapslock(event){
    this.capsLock=event.getModifierState("CapsLock")
    if (this.capsLock){
      this._ui.error('Caps Lock is on!!')
    }
  }
}

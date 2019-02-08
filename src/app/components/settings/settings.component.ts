import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { ConfigSetting } from 'src/app/models/configsetting.model';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { UIService } from 'src/app/services/ui.service';
import { NullViewportScroller } from '@angular/common/src/viewport_scroller';

@Component({
  selector: 'app-config',
  templateUrl: './settings.component.html',
  styles: [`

  `]
})
export class SettingsComponent implements OnInit {

  constructor(private _bs : BackendService, private _ui: UIService) { 
  }
  settings: ConfigSetting[]=[];
  logonForm: FormGroup
  changePwdForm: FormGroup
  loggedOn = false //get from route?@!??!
  changepwdClicked=false
  capsLock=false
  ngOnInit() {
    this.initForms()
    this.readConfig()
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
  
  readConfig(){
    this.settings.length=0 //to trigger short screen feedback
    this._bs.readConfig()
      .then((result)=>{
        this.settings = result
        //console.log(this.settings)
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

  onLogon(){
    console.log( 'setings component: sending pwd ' + this.logonForm.get('password').value)
    this._bs.logOn(this.logonForm.get('password').value)
    .then(()=>{
      this.loggedOn =true
      this._ui.success()
    })
  .catch((err)=>{
    this.loggedOn =false
    this._ui.error("password incorrect")
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
          this._bs.changePassword(oldpass, new1).then(()=>{
            this.changepwdClicked=!this.changepwdClicked
            this._ui.success()
          })
          .catch(x=> this._ui.error("Error writing config."))
        }
      })
      .catch(()=> this._ui.error("oude wachtwoord helaas niet goed"))
  }
}

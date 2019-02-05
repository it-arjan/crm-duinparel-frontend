import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigSetting } from 'src/app/models/configsetting.model';

@Component({
  selector: 'app-config',
  templateUrl: './settings.component.html',
  styles: [`

  `]
})
export class SettingsComponent implements OnInit {

  constructor(private _cfg : ConfigService) { 

  }
  settings: ConfigSetting[];

  ngOnInit() {
    this.readConfig()
    }

readConfig(){
  this._cfg.readConfig().then((result)=>{
    this.settings = result
    console.log(this.settings)
    });

}
writeConfig(){
  //this._cfg.changePassword();
  this._cfg.writeConfig(this.settings)
}
}

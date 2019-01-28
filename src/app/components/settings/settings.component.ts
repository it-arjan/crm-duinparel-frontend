import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-config',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(private _cfg : ConfigService) { }
  
  ngOnInit() {
    this._cfg.readConfig();
  }
readConfig(){
  this._cfg.readConfig();
}
writeConfig(){
  //this._cfg.changePassword();
  this._cfg.test()
}
}

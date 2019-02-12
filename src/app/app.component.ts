import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: ['.drop{ margin-top: 10px;}']
})
export class AppComponent implements OnInit {
  constructor(){}
  title = 'Duinparel-CRM';
  
  ngOnInit(){
  }
}

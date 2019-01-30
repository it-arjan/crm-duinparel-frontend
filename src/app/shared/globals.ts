import { OnInit, Injectable } from '@angular/core';

@Injectable()
export class Globals implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  public static momDateformat:string='DD MMM YY' 
  public static momDatePattern:RegExp = new RegExp(/[0-9][0-9] [a-zA-Z][a-z][a-z] [0-9][0-9]/)
  public static angDateformat:string='dd MMM yy' 
  public static jsDateformat:string='DD MMM YY' 
  
}

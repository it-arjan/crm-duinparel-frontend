import { OnInit, Injectable } from '@angular/core';

@Injectable()
export class Globals implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  public static momDateformat:string='D MMM YY' 
  public static momDatePattern:RegExp = new RegExp(/[0-9][0-9]? [a-zA-Z][a-z][a-z] [0-9][0-9]/)
  public static angDateformat:string='d MMM yy' 
  public static jsDateformat:string='D MMM YY' 
  public static bookTypes = ['week','midweek','weekend']

  public static propCodes:Array<string>=['app', 'alb', 'jvg' ]
  public static propTypesMailing = ['app','huis']
  public static propType2PropCode(screenSelection:string){
    return screenSelection=='app' ? ['app']:['jvg', 'alb']
  }
}

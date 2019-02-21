import { OnInit, Injectable } from '@angular/core';

@Injectable()
export class Globals {

  constructor() { }

  public static momDateformat:string='D MMM YY' 
  public static momDatePattern:RegExp = new RegExp(/[0-9][0-9]? [a-zA-Z][a-z][a-z] [0-9][0-9]/)
  public static angularDateformat:string='d MMM yy' 
  public static angularDateformatWithWeekDay:string='EEE, d MMM yy' 
  public static angularDateTimeformat:string='MMM d - H:mm' 

  public static jsDateformat:string='D MMM YY' 
  public static bookTypes = ['week','midweek','weekend']

  public static propCodes:Array<string>=['app', 'alb', 'jvg' ]
  public static propTypesMailing = ['app','huis']
  public static propType2PropCode(screenSelection:string){
    return screenSelection=='app' ? ['app']:['jvg', 'alb']
  }

  public static jsDateDiffMonths(d1:Date, d2:Date){
    var d1Y = d1.getFullYear();
    var d2Y = d2.getFullYear();
    var d1M = d1.getMonth();
    var d2M = d2.getMonth();

    return (d2M+12*d2Y)-(d1M+12*d1Y)
}
}

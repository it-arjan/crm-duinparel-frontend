import { OnInit, Injectable } from '@angular/core';
import * as moment from 'moment';
import 'moment/locale/nl'  // without this line it didn't work
moment.locale('nl')

export enum tDateError { arrive_invalid, depart_invalid, depart_before_arrive}
@Injectable()
export class Globals {

  constructor() { }

  public static momDateformat:string='D MMM YY' 
  public static momDatePattern:RegExp = new RegExp(/[0-9][0-9]? [a-zA-Z][a-z][a-z]\.+ [0-9][0-9]/)
  public static slotPattern:RegExp = new RegExp(/[0-9][0-9]?\/[0-9][0-9]?,[0-9][0-9]?\/[0-9][0-9]?/)
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

public static checkDates(arrive_str:string, depart_str:string):{valid:boolean, error:tDateError}{
    let result = {valid:true, error:null}
     if (arrive_str && depart_str && 
          Globals.momDatePattern.test(arrive_str) && 
          Globals.momDatePattern.test(depart_str)){
      
        let m_arrive = moment(arrive_str, Globals.momDateformat);
        let m_depart = moment(depart_str, Globals.momDateformat);
        if (!m_arrive.isValid() || !m_depart.isValid()){
          if (!m_arrive.isValid()) result.error=tDateError.arrive_invalid
          if (!m_depart.isValid()) result.error=tDateError.depart_invalid

          result.valid=false
        }
        else if(m_arrive.isSame(m_depart) || m_arrive.isAfter(m_depart)) {
          result.error=tDateError.depart_before_arrive
          result.valid=false
        }
      }
      return result
  }
}

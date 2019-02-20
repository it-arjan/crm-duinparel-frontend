import { Component, OnInit, OnDestroy } from '@angular/core'
import { UIService } from 'src/app/services/ui.service'
import { tGuiguidance, tComponentNames } from 'src/app/services/interfaces.ui'
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-booking-wrap',
  templateUrl: './booking-wrap.component.html',
  styleUrls: ['./booking-wrap.component.css']
})
export class BookingWrapComponent implements OnInit, OnDestroy { //todo rename to  customer-booking-wrap

  constructor(private _ui: UIService) { }
  outletActive=true
  outlet_componentnames:tComponentNames[]=[tComponentNames.newEditCustomer, tComponentNames.listBooking]
  ngOnInit() {
    this._ui.guider()//.pipe(take(1)) 
    .subscribe((guidance: tGuiguidance)=>{
      this.outlet_componentnames.forEach(name => {
        if (guidance.timeToGo.includes(name)) this.outletActive=false
        else if (guidance.wakeUp.includes(name)) this.outletActive=true
      })
  })
  }
  
  ngOnDestroy(){
    //this._ui.guidance().unsubscribe()
  }
}

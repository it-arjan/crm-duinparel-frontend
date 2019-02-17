import { Component, OnInit, OnDestroy } from '@angular/core'
import { UIService } from 'src/app/services/ui.service'
import { tGuiguidance, tComponentNames } from 'src/app/services/interfaces.ui'

@Component({
  selector: 'app-booking-wrap',
  templateUrl: './booking-wrap.component.html',
  styleUrls: ['./booking-wrap.component.css']
})
export class BookingWrapComponent implements OnInit, OnDestroy { //todo rename to  customer-booking-wrap

  constructor(private _ui: UIService) { }
  routeActive=true
  outlet_names:tComponentNames[]=[tComponentNames.newEditCustomer, tComponentNames.listBooking]
  ngOnInit() {
        this._ui.guidance().subscribe((guidance: tGuiguidance)=>{
          this.outlet_names.forEach(name => {
            if (guidance.timeToGo.includes(name)) this.routeActive=false
            else if (guidance.wakeUp.includes(name)) this.routeActive=true
          })
      })

  }
  ngOnDestroy(){
    this._ui.guidance().unsubscribe()
  }
}

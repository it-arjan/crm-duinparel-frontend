import { Component, OnInit, OnDestroy } from '@angular/core'
import { UIService } from 'src/app/services/ui.service'
import { tGuiguidance, tComponentNames } from 'src/app/services/interfaces.ui'
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-booking-wrap',
  templateUrl: './customer-wrap.component.html',
  styleUrls: ['./customer-wrap.component.css']
})
export class BookingWrapComponent implements OnInit, OnDestroy { //todo rename to  customer-booking-wrap

  constructor(private _ui: UIService) { }

  outletActive=true
  custSearchActive=true
  custListActive=false
  
  outlet_componentnames:tComponentNames[]=[tComponentNames.newEditCustomer, tComponentNames.listBooking]
ngOnInit() {
    this._ui.guider()//.pipe(take(1)) 
    .subscribe((guidance: tGuiguidance)=>{
      
      this.outlet_componentnames.forEach(name => {
        if (guidance.hideList.includes(name)) this.outletActive=false
        else if (guidance.displayList.includes(name)) this.outletActive=true
      })

      // if (guidance.hideList.includes(tComponentNames.searchCustomer)) this.custSearchActive = false
      // else if (guidance.displayList.includes(tComponentNames.searchCustomer)) this.custSearchActive=true

      // if (guidance.hideList.includes(tComponentNames.listCustomer)) this.custListActive = false
      // else if (guidance.displayList.includes(tComponentNames.listCustomer)) this.custListActive=true

  })
  }
  
  ngOnDestroy(){
    //this._ui.guidance().unsubscribe()
  }
}

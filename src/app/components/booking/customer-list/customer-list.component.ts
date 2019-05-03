import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Customer } from 'src/app/models/customer.model';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { UIService } from 'src/app/services/ui.service';
import { tGuistate, tGuiguidance, tComponentNames } from 'src/app/services/interfaces.ui';
import { GuidanceService } from 'src/app/services/guidance.service';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styles: [`
:host { /* see if this affects the position: absolute behavior */
    display: block;
    }
.rowselect{
  background-color: #C7DBF0;
}
.show-hover{
    cursor:pointer;
    padding:0px;
} 
.highlight div {
    padding:5px;
}
.highlight:hover{
    background:#adcaeb;
}
`]})
export class CustomerListComponent implements OnInit {
  customers : Customer[]=[]
  selectedIdx:number

  @ViewChild("customer_list_cover") coverRef: ElementRef

  constructor(private _router: Router, private _ds: DataService, 
              private _guidance: GuidanceService, private _ui: UIService,
              private hostRef:ElementRef) { 
              }

  ngOnInit() {
    this._ds.searchResults()
    .subscribe((searchResult: Customer[]) =>{
      console.log('CustomerListComponent received searchCompleted$') 
        this.customers.length =  0
        searchResult.forEach(x=>this.customers.push(x))
    })
    this._ui.guider()//.pipe(take(1)) 
      .subscribe((guidance: tGuiguidance)=>{
        console.log(guidance)
        this._guidance.handleGuidance(tComponentNames.listCustomer, this.hostRef, this.coverRef, guidance)

        })
  }
  ngOnDestroy(){
    //this._ds.searchCompleted$.unsubscribe()
  }  
  onClick(idx:number, action:string){
    this.selectedIdx=idx; 

    if (action==='book') {
      this._router.navigate(['booking','cust',this.customers[this.selectedIdx].id, 'bookings'])
      this._ui.checkin(tGuistate.editCustomerOpen)
    }
    else {
      this._router.navigate(['booking','cust',this.customers[this.selectedIdx].id])
      this._ui.checkin(tGuistate.bookingsOfCustomerOpen)
    }
  }
  onDblclick(idx: number){
    this._ds.searchCustomers(this.customers[idx].email,null)
  }
}

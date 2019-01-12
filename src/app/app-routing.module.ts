import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BookingWrapComponent } from './booking/booking-wrap/booking-wrap.component';
import { MailingWrapComponent } from './mailing/mailing-wrap/mailing-wrap.component';
import { BookingListComponent } from './booking/booking-list/booking-list.component';
import { CustomerNewEditComponent } from './booking/customer-new-edit/customer-new-edit.component';

const appRoutes: Routes = [
    // {path: '', component: AppComponent},
    {path: 'booking', component: BookingWrapComponent, children: [
        {path:'cust/new', component: CustomerNewEditComponent},
        {path:'cust/:custid', component: CustomerNewEditComponent},
        {path:'cust/:custid/bookings', component: BookingListComponent},
    ]},
    {path: 'mailing', component: MailingWrapComponent},
]
@NgModule(
    {
        imports: [    
            RouterModule.forRoot(appRoutes)
        ],
        exports: [RouterModule] //defines what is exposed when this module is imported       
    }
)
export class AppRoutingModule { 

}

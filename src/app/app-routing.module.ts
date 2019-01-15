import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BookingWrapComponent } from './components/booking/booking-wrap/booking-wrap.component';
import { MailingComponent } from './components/mailing/mailing/mailing.component';
import { BookingListComponent } from './components/booking/booking-list/booking-list.component';
import { CustomerNewEditComponent } from './components/booking/customer-new-edit/customer-new-edit.component';
import { ConfigComponent } from './components/config/config.component';

const appRoutes: Routes = [
    // {path: '', component: AppComponent},
    {path: 'booking', component: BookingWrapComponent, children: [
        {path:'cust/new', component: CustomerNewEditComponent},
        {path:'cust/:custid', component: CustomerNewEditComponent},
        {path:'cust/:custid/bookings', component: BookingListComponent},
    ]},
    {path: 'mailing', component: MailingComponent},
    {path: 'config', component: ConfigComponent},
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

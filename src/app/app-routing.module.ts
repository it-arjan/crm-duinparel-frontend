import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BookingWrapComponent } from './components/booking/booking-wrap/booking-wrap.component';
import { MailingComponent } from './components/mailing/mailing/mailing.component';
import { BookingComponent } from './components/booking/booking/booking.component';
import { CustomerNewEditComponent } from './components/booking/customer-new-edit/customer-new-edit.component';
import { SettingsComponent } from './components/settings/settings.component';

const appRoutes: Routes = [
    // {path: '', component: AppComponent},
    {path: 'booking', component: BookingWrapComponent, children: [
        {path:'cust/new', component: CustomerNewEditComponent}, 
        {path:'cust/:custid', component: CustomerNewEditComponent},
        {path:'cust/:custid/bookings', component: BookingComponent},
    ]},
    {path: 'mailing', component: MailingComponent},
    {path: 'config', component: SettingsComponent},
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

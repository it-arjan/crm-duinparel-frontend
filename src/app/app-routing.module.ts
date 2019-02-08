import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BookingWrapComponent } from './components/booking/booking-wrap/booking-wrap.component';
import { MailingComponent } from './components/mailing/mailing/mailing.component';
import { BookingComponent } from './components/booking/booking/booking.component';
import { CustomerNewEditComponent } from './components/booking/customer-new-edit/customer-new-edit.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AuthGuardService } from './services/auth.guard.service';
import { AppComponent } from './app.component';

const appRoutes: Routes = [
    {path: '', component: AppComponent, canActivate: [AuthGuardService]},
    {path: 'booking', component: BookingWrapComponent, canActivate: [AuthGuardService], children: [
        {path:'cust/new', component: CustomerNewEditComponent, canActivate: [AuthGuardService]}, 
        {path:'cust/:custid', component: CustomerNewEditComponent, canActivate: [AuthGuardService]},
        {path:'cust/:custid/bookings', component: BookingComponent, canActivate: [AuthGuardService]},
    ]},
    {path: 'mailing', component: MailingComponent, canActivate: [AuthGuardService]},
    {path: 'settings', component: SettingsComponent},
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

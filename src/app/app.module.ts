import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { NgxElectronModule } from 'ngx-electron';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HeaderComponentComponent } from './components/header/header.component';
import { DropdownDirective } from './shared/dropdown.directive';
import { BookingWrapComponent } from './components/booking/booking-wrap/booking-wrap.component';
import { CustomerSearchComponent } from './components/booking/customer-search/customer-search.component';
import { CustomerListComponent } from './components/booking/customer-list/customer-list.component';
import { CustomerNewEditComponent } from './components/booking/customer-new-edit/customer-new-edit.component';
import { MailingWrapComponent } from './components/mailing/mailing-wrap/mailing-wrap.component';
import { BookingListComponent } from './components/booking/booking-list/booking-list.component';
//import { CustomerListItemComponent } from './booking/customer-list-item/customer-list-item.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponentComponent,
    DropdownDirective,
    BookingWrapComponent,
    CustomerSearchComponent,
    CustomerListComponent,
    CustomerNewEditComponent,
    MailingWrapComponent,
    BookingListComponent,
   // CustomerListItemComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgxElectronModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

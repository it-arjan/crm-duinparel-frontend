import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgxElectronModule } from 'ngx-electron';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HeaderComponentComponent } from './components/header/header.component';
import { DropdownDirective } from './shared/dropdown.directive';
import { BookingWrapComponent } from './components/booking/booking-wrap/booking-wrap.component';
import { CustomerSearchComponent } from './components/booking/customer-search/customer-search.component';
import { CustomerListComponent } from './components/booking/customer-list/customer-list.component';
import { CustomerNewEditComponent } from './components/booking/customer-new-edit/customer-new-edit.component';
import { MailingComponent } from './components/mailing/mailing/mailing.component';
import { BookingComponent } from './components/booking/booking/booking.component';
import { SettingsComponent } from './components/settings/settings.component';
import {NgbModule, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from './components/ng-bootstrap/modal-confirm/modal-confirm.component';
import { ModalDaterangeSelectComponent } from './components/ng-bootstrap/modal-daterange-select/modal-daterange-select.component';
import { Nl2BrPipe } from './shared/nl2br.pipe';
import { AssumeSafeHtmlPipe } from './shared/assumeSafeHtml.pipe';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponentComponent,
    DropdownDirective,
    BookingWrapComponent,
    CustomerSearchComponent,
    CustomerListComponent,
    CustomerNewEditComponent,
    MailingComponent,
    BookingComponent,
    SettingsComponent,
    ModalConfirmComponent,
    ModalDaterangeSelectComponent,
    Nl2BrPipe,
    AssumeSafeHtmlPipe,
  ],
  entryComponents: [
    ModalConfirmComponent,
    ModalDaterangeSelectComponent
  ],
  imports: [
    NgbModule,
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgxElectronModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

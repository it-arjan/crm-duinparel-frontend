import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingWrapComponent } from './booking-wrap.component';

describe('BookingWrapComponent', () => {
  let component: BookingWrapComponent;
  let fixture: ComponentFixture<BookingWrapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookingWrapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingWrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

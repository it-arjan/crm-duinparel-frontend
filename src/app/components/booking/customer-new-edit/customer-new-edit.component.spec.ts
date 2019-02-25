import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerNewEditComponent } from './customer-new-edit.component';

describe('CustomerNewComponent', () => {
  let component: CustomerNewEditComponent;
  let fixture: ComponentFixture<CustomerNewEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerNewEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerNewEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

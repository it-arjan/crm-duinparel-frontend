import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailingWrapComponent } from './mailing-wrap.component';

describe('MailingWrapComponent', () => {
  let component: MailingWrapComponent;
  let fixture: ComponentFixture<MailingWrapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailingWrapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailingWrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

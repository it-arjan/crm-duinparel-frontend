import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDaterangeSelectComponent } from './modal-daterange-select.component';

describe('ModalDaterangeSelectComponent', () => {
  let component: ModalDaterangeSelectComponent;
  let fixture: ComponentFixture<ModalDaterangeSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalDaterangeSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDaterangeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

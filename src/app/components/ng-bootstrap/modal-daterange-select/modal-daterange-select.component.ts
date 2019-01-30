import { Component, OnInit } from '@angular/core';
import { NgbDate, NgbCalendar, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-daterange-select',
  template: `
  <ngb-datepicker #dp (select)="onDateSelection($event)" [displayMonths]="2" [dayTemplate]="t" outsideDays="hidden">
  </ngb-datepicker>
  <ng-template #t let-date let-focused="focused">
          <span class="custom-day"
                [class.focused]="focused"
                [class.range]="isRange(date)"
                [class.faded]="isHovered(date) || isInside(date)"
                (mouseenter)="hoveredDate = date"
                (mouseleave)="hoveredDate = null">
            {{ date.day }}
          </span>
        </ng-template>
        <p  class="text-center" style="margin-top:5px"><button type="button" class="btn btn-outline-dark" *ngIf="dateSelected" (click)="activeModal.close({'fromNgb': fromDate, 'toNgb': toDate})">Selecteer</button></p>
  `,
  styles: [`
  .custom-day {
    text-align: center;
    padding: 0.185rem 0.25rem;
    display: inline-block;
    height: 2rem;
    width: 2rem;
  }
  .custom-day.focused {
    background-color: #e6e6e6;
  }
  .custom-day.range, .custom-day:hover {
    background-color: rgb(2, 117, 216);
    color: white;
  }
  .custom-day.faded {
    background-color: rgba(2, 117, 216, 0.5);
  }
    `]
})
export class ModalDaterangeSelectComponent implements OnInit {

  constructor(public calendar: NgbCalendar, public activeModal: NgbActiveModal) { }
  dateSelected=false;
  hoveredDate: NgbDate;

  fromDate: NgbDate;
  toDate: NgbDate;
  ngOnInit() {
  }
  onDateSelection(date: NgbDate) {
    //console.log('onDateSelection')
    if (!this.fromDate && !this.toDate) {
      //console.log('!this.fromDate && !this.toDate')
      this.fromDate = date;
      this.dateSelected=false;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      //console.log('this.fromDate && !this.toDate && date.after(this.fromDate)')
      this.toDate = date;
      this.dateSelected=true;
      //console.log(this.fromDate)
      //console.log(this.toDate)
    } else {
      //console.log('else')
      this.toDate = null;
      this.fromDate = date;
      this.dateSelected=false;
    }
  }

  isHovered(date: NgbDate) {
    //console.log('isHovered')
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    //console.log('isInside')
    return date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    //console.log('isRange')
    return date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);
  }
}

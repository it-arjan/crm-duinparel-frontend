import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';

import { DataService } from './data.service';
import { PersistFakeService } from './persist.fake.service';
import { UIService } from './ui.service';
import { AuthFakeService } from './auth.fake.service';
import { CustomerBatch } from '../models/customerbatch.model';
import { Globals } from '../shared/globals';
import * as moment from 'moment';
import 'moment/locale/nl'  // without this line it didn't work
moment.locale('nl')

describe('Dataservice Search', () => {
  beforeEach(async(() => {

  }))
  let persist = new PersistFakeService();
  let auth= new AuthFakeService();
  let ui= new UIService(auth);
  let dataService: DataService = new DataService(persist, ui);

  it('should be created', () => {
    expect(dataService).toBeTruthy();
  })

  it('after getData, customer 2 should exist',async(() => {
    dataService.getData();
    //tick();
    dataService.dataReadyReplay().subscribe(()=>{
      expect(dataService.getCustomer(2)).toBeTruthy();
    })
  }))

  it('Searching for a specific email should produce results', async(() => {
    dataService.searchCustomers('jjanse.huismens@hotmail.com','');
    dataService.searchResults().subscribe(()=>{
      expect(dataService.searchResult.length ).toEqual(1);
    })
  }))
  //check Mailing selection
  // calibrate to 01-01-2019
 	let correction = moment().diff(moment('2019-01-01'), 'months'),
    slot:string = null, 
    batch: CustomerBatch[]=null,
    monthsNotVisitedFrom=null,
    monthsNotVisitedUntil=null,
    monthsNotMailedSince=null,
    totalVisits=null,
    selectedProptypes=null, 
    selectedBooktypes=null;
      
  it('Criteria-1 should find correct nr of emails', () => {

    monthsNotVisitedFrom = 23 + correction
    monthsNotVisitedUntil=null,
    monthsNotMailedSince=null,
    totalVisits=null,
    selectedProptypes= Globals.propType2PropCode('app'), //alt arg = 'huis'
    selectedBooktypes = Globals.bookTypes.slice();

    batch = dataService.searchEmails (
                    '', monthsNotVisitedFrom, monthsNotVisitedUntil, monthsNotMailedSince,
                    totalVisits,
                    selectedProptypes, selectedBooktypes
                  );
    expect(batch.length).toEqual(1, "batch length wrong.");
    expect(batch[0].custList.length).toEqual(1, `nr of emails wrong`);
  })


  it('Criteria-2 should find correct nr of emails', () => {
  
    monthsNotVisitedFrom = 20 + correction;
    batch = dataService.searchEmails (
                        '', monthsNotVisitedFrom, monthsNotVisitedUntil, monthsNotMailedSince,
                        totalVisits,
                        selectedProptypes, selectedBooktypes
                      );
    expect(batch.length).toEqual(1, "batch length should be 1");
    expect(batch[0].custList.length).toEqual(3, `nr of emails wrong`);
  })
});

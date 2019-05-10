import { iAuthResult } from './interfaces.auth';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
@Injectable()
export abstract class AuthBase {
  authCompleted$ = new ReplaySubject<boolean>()
  abstract isAuthenticated() : boolean //legacy
  
  //new way
  raiseAuthCompleted(result: boolean){
    this.authCompleted$.next(result)
  }
  authCompletedReplay(): ReplaySubject<boolean> { 
    return this.authCompleted$
  }
  abstract logOn(pwd:string): Promise<string>
  abstract changePassword(oldpass:string, newpass:string) : Promise<iAuthResult>
}
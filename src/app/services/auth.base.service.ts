import { iAuthResult } from './interfaces.auth';
import { Injectable } from '@angular/core';
@Injectable()
export abstract class AuthBase {
  abstract isAuthenticated() : boolean 
  abstract logOn(pwd:string): Promise<string>
  abstract changePassword(oldpass:string, newpass:string) : Promise<iAuthResult>
}
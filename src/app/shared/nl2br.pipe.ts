import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'nl2br',
  pure: false
})
export class Nl2BrPipe implements PipeTransform {
  constructor(private sanitizer:DomSanitizer){}
  transform(value: any): any {
    console.log('nl2br')
    if (value.length == 0)
      return value
    if (typeof value === "string"){
      return value.replace('\n', '<br/>')
    }
    else throw new Error('invalid type' + typeof value)
  }

}

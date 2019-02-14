export class Mailing {
  constructor(public id: number,public sent: Date, public purpose: string, public customerIds:Array<number>){}
}
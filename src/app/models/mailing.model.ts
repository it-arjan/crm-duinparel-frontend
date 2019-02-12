export class Mailing {
  constructor(private id: number,private sent: Date, private purpose: string, private customerIds:Array<number>){}
}
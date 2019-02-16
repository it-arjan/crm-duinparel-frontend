export class Mailing {
  constructor(public id: number,public sent: Date, public purpose: string, public customerids:Array<number>){}
  
  consumeMailingDeep(toClone: Mailing){
    this.id = toClone.id
    this.sent = toClone.sent
    this.purpose = toClone.purpose
    this.customerids=[]
    if(toClone.customerids) 
      this.customerids = [].concat(toClone.customerids)
  }
}
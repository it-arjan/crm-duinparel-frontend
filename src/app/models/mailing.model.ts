export class Mailing {
  constructor(public id: number,public sent: Date, public purpose: string, public customerIds:Array<number>){}
  
  consumeMailingDeep(toClone: Mailing){
    this.id = toClone.id
    this.sent = new Date(toClone.sent)
    this.purpose = toClone.purpose
    this.customerIds=[]
    if(toClone.customerIds) 
      this.customerIds.concat(toClone.customerIds)
  }
}
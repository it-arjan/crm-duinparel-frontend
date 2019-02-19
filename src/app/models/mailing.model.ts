export class Mailing {
  constructor(public id: number,public sent: number, public purpose: string, public customerids:Array<number>){}
  
  static consumeJsMailing(toClone: jsMailing) {
    let result =new Mailing(0, 0,'',[])
    result.id = toClone.id
    result.sent = toClone.sent
    result.purpose = toClone.purpose
    result.customerids=[]
    if(toClone.customerids) result.customerids = toClone.customerids.map(x=>result.customerids.push(x)) 
    return result
  }
}
export class jsMailing {
    constructor(public id: number,public sent: number, public purpose: string, public customerids:Array<number>){}
}
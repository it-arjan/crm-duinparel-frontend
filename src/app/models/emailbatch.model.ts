export class EmailBatch {
    constructor(max:number){
        this._maxSize=max
        this.emails = []
    }
    private _maxSize:number=95 
    emails: string[]
    
    add(email:string) : boolean{
        const space = this.emails.length < this._maxSize
        if (space) this.emails.push(email)
        return space;
    }
}
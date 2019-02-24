import { ufType } from '../services/interfaces.ui';

export class MessageFeedback{
    constructor(public type:ufType, public message:string){
    }
    classList:string
    
}
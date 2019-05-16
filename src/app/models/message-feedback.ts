import { ufType } from '../services/interfaces/interfaces.ui';

export class MessageFeedback{
    constructor(public type:ufType, public message:string){
    }
    classList:string
    
}
import { ufType } from '../services/interfaces.ui';

export class UserFeedback{
    constructor(public type:ufType, public message:string    ){
      this.showAsMsg = type > ufType.iconSuccess
      this.showAsIcon = !this.showAsMsg
      this.classList = this.getClassList()
    }
    classList:string
    showAsMsg: boolean
    showAsIcon: boolean
    
    getClassList(){
    switch (this.type){
      case ufType.msgInfo: 
        return 'info'
      case ufType.msgWarn: 
        return 'warning'
      case ufType.msgError: 
        return 'danger'
          case ufType.iconSuccess: 
            return 'fa-check crm-success'
          case ufType.iconCancelled: 
            return 'fa-hand-paper-o crm-success'
          case ufType.iconRemoved: 
            return 'fa-hand-o-down crm-success'
            default: return ''
      }
    }
    toHistory(){
      return (this.message && this.type != ufType.msgInfo)
    }
}
export class IconFeedback{
    constructor(iconType:string){
        this.iconClasses=this.getIcon(iconType)
    }
    iconClasses:string;
    getIcon(iconType:string){
        switch (iconType){
          case 'Success': 
            return 'fa-check crm-success'
          case 'Cancelled': 
            return 'fa-hand-paper-o crm-success'
          case 'Removed': 
            return 'fa-hand-o-down crm-success'
        }
    }
}
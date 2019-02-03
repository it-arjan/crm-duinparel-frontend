import {Directive, HostListener, ElementRef, Renderer2, HostBinding} from '@angular/core';
@Directive({
    selector: '[appDropdown]' // [] = attribute directive
})
//bootstrap can also open a dropdown out of the box, 
//but we haven't included the bootstrap scripting
//we won't add it, we only want angular to interact with our DOM
export class DropdownDirective{
    //add the class 'open' on clicking the element
    //remove it when clicked again
    // constructor(private myElt : ElementRef, private renderer: Renderer2) {
    // }
    @HostBinding('class.open') isOpen : boolean = false; 
    // one property for each element where this directive is placed on is not a problem
    
    @HostListener('click') dropDownClick(){
        this.isOpen = !this.isOpen;
        // if (this.isOpen){
        //     this.renderer.addClass(this.myElt.nativeElement,'open');
        // } else {
        //     this.renderer.removeClass(this.myElt.nativeElement,'open');
        // }
        
    }

}
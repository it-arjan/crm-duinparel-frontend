import { Component, Renderer2, ElementRef } from '@angular/core';
import { tComponentNames, tGuiguidance } from '../interfaces/interfaces.ui';

@Component({
  selector: 'not-used-is-base-component',
  template: '',
  styles: [`

  `]
})
export class UIGuidableComponent {
  constructor(private renderer: Renderer2) {
  }
  protected uiGuidanceName: tComponentNames

  protected setGuidanceName(name: tComponentNames){
    this.uiGuidanceName=name;
  }
  protected handleGuidance(outerRef: ElementRef, clickCoverRef: ElementRef, guidance: tGuiguidance) {
    console.log(tComponentNames[this.uiGuidanceName], guidance);
    if (guidance.hideList.includes(this.uiGuidanceName)) this.uiHide(outerRef, clickCoverRef);
    else if (guidance.displayList.includes(this.uiGuidanceName)) this.uiShow(outerRef, clickCoverRef);
    else if (guidance.blurList.includes(this.uiGuidanceName)) this.uiBlur(outerRef, clickCoverRef);
  }

  private uiHide(outerRef: ElementRef, clickCoverRef: ElementRef) {
    //opacity main container to 100%
    console.log(tComponentNames[this.uiGuidanceName] + '.hide() ');
    this.setCover(outerRef, clickCoverRef, true);
    this.setOuter(outerRef, 0);
  }

  private uiShow(outerRef: ElementRef, clickCoverRef: ElementRef) {
    console.log(tComponentNames[this.uiGuidanceName] + '.show() ');
    this.setCover(outerRef, clickCoverRef, false);
    this.setOuter(outerRef, 1);
  }
  private uiBlur(outerRef: ElementRef, clickCoverRef: ElementRef) {
    console.log(tComponentNames[this.uiGuidanceName] + '.blur() ');
    this.setCover(outerRef, clickCoverRef, true, 0.2);
    this.setOuter(outerRef, 0.5);
  }

  private setOuter(outerRef: ElementRef, opa: number) {
    this.renderer.setStyle(outerRef.nativeElement, 'opacity', opa);
  }

  private setCover(outerRef: ElementRef, clickCoverRef: ElementRef, showcover: boolean, opa?: number) {
    console.log('setCover:' + showcover)
    if (showcover) {
      this.renderer.setStyle(clickCoverRef.nativeElement, 'position', 'absolute');
      this.renderer.setStyle(clickCoverRef.nativeElement, 'display', 'block');
      this.renderer.setStyle(clickCoverRef.nativeElement, 'z-index', 100);
      this.renderer.setStyle(clickCoverRef.nativeElement, 'background-color', 'grey');
      if (opa !== undefined) this.renderer.setStyle(clickCoverRef.nativeElement, 'opacity', opa);

      var outerrectvalues = outerRef.nativeElement.getBoundingClientRect();
      console.log(outerrectvalues.top, outerrectvalues.left, outerRef.nativeElement.offsetWidth, outerRef.nativeElement.offsetHeight);

      // this.renderer.setStyle(clickCoverRef.nativeElement, 'top',outerrectvalues.top+"px")
      // this.renderer.setStyle(clickCoverRef.nativeElement, 'left',outerrectvalues.left+"px")

      this.renderer.setStyle(clickCoverRef.nativeElement, 'width', outerRef.nativeElement.offsetWidth + "px");
      this.renderer.setStyle(clickCoverRef.nativeElement, 'height', outerRef.nativeElement.offsetHeight + "px");

    } else { // show component means hide cover
      this.renderer.setStyle(clickCoverRef.nativeElement, 'opacity', 0);
      this.renderer.setStyle(clickCoverRef.nativeElement, 'display', 'none');
    }
  }
}
import { ElementRef, Renderer2, Injectable, RendererFactory2 } from '@angular/core';
import { tComponentNames, tGuiguidance } from './interfaces.ui';

@Injectable({
  providedIn: 'root' 
})

export class GuidanceService {
  
  constructor(rendererFactory: RendererFactory2 ){
    this.renderer = rendererFactory.createRenderer(null, null);
  }
  private renderer: Renderer2;
  public handleGuidance(uiGuidanceName:tComponentNames, outerRef: ElementRef, clickCoverRef: ElementRef, guidance:tGuiguidance){
    console.log(tComponentNames[uiGuidanceName], guidance)
    if (guidance.hideList.includes(uiGuidanceName)) this.uiHide(uiGuidanceName, outerRef, clickCoverRef)
    else if (guidance.displayList.includes(uiGuidanceName)) this.uiShow(uiGuidanceName, outerRef, clickCoverRef)
    else if (guidance.blurList.includes(uiGuidanceName)) this.uiBlur(uiGuidanceName, outerRef, clickCoverRef)
  }

  private uiHide(uiGuidanceName:tComponentNames, outerRef: ElementRef, clickCoverRef: ElementRef){
    //opacity main container to 100%
    console.log('hiding ' + tComponentNames[uiGuidanceName])
    this.setCover(outerRef, clickCoverRef, true)
    this.setOuter(outerRef, 0)
  }
  private uiShow(uiGuidanceName:tComponentNames, outerRef: ElementRef, clickCoverRef: ElementRef){
    console.log('showing ' + tComponentNames[uiGuidanceName])
    this.setCover(outerRef, clickCoverRef, false)
    this.setOuter(outerRef, 1)
  }
  private uiBlur(uiGuidanceName:tComponentNames, outerRef: ElementRef, clickCoverRef: ElementRef){
    console.log('blurring ' + tComponentNames[uiGuidanceName])
    this.setCover(outerRef, clickCoverRef, true, 0.2)
    this.setOuter(outerRef, 0.5)
  }

  private setOuter(outerRef: ElementRef, opa: number){
    this.renderer.setStyle(outerRef.nativeElement, 'opacity', opa)
  }

  private setCover(outerRef: ElementRef, clickCoverRef: ElementRef, showcover:boolean, opa?: number){
    console.log('setCover') 
    if (showcover){
      this.renderer.setStyle(clickCoverRef.nativeElement, 'position','absolute')
      this.renderer.setStyle(clickCoverRef.nativeElement, 'display','block')
      this.renderer.setStyle(clickCoverRef.nativeElement, 'z-index',100)
      this.renderer.setStyle(clickCoverRef.nativeElement, 'background-color','grey')
      if (opa !== undefined) this.renderer.setStyle(clickCoverRef.nativeElement, 'opacity',opa)

      var outerrectvalues = outerRef.nativeElement.getBoundingClientRect();
      console.log(outerrectvalues.top, outerrectvalues.left, outerRef.nativeElement.offsetWidth, outerRef.nativeElement.offsetHeight);
      
      // Investigate why I cannot set top and left in angular app, but i should set left in html test with bootstrap styling
      this.renderer.setStyle(clickCoverRef.nativeElement, 'top',outerrectvalues.top+"px")
      this.renderer.setStyle(clickCoverRef.nativeElement, 'left',outerrectvalues.left+"px")

      this.renderer.setStyle(clickCoverRef.nativeElement, 'width',outerRef.nativeElement.offsetWidth+"px")
      this.renderer.setStyle(clickCoverRef.nativeElement, 'height',outerRef.nativeElement.offsetHeight+"px")

    } else { // show component means hide cover
      this.renderer.setStyle(clickCoverRef.nativeElement, 'opacity', 0)
      this.renderer.setStyle(clickCoverRef.nativeElement, 'display','none')
    }
  }
}
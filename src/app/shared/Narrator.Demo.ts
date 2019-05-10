import { UIService } from '../services/ui.service';
import { Injectable } from '@angular/core';
import { EmptyNarrator } from './Narrator.Empty';

//@Injectable()
@Injectable({
  providedIn: 'root' 
})
export class DemoNarrator extends EmptyNarrator{
  constructor(public _ui: UIService){
    super()
  }

  private story: string[]=[
    'The fake data backend has a programmed delay between 0-2 sec.',
    'Tip 1: Refresh a deeplink to see how the app handles these data delays.',
    'Tip 2: Check the layout as well on Mobile as on Desktop.',
    'Tip 3: Change some data (esp on desktop) to see how this affects the layout.',
  ]
  
  public startNarrating(){
    console.log('============ startNarrating!!!!======================')

    let incTimeout=5000
    let timeout=incTimeout
    this.story.forEach(x=>{
      setTimeout(() => {
        this._ui.info(x)         
      }, timeout);
      timeout += incTimeout
    })
  }
}
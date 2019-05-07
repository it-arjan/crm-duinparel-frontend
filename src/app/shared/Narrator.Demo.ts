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
    'Tip: View the layout on Mobile as well as on Desktop',
    'Tip: Change some data to see how this affects the layout!',
  ]
  
  public startNarrating(){
    console.log('============ startNarrating!!!!======================')
    //msgs are buffered in _ui
    this.story.forEach(x=>{
      this._ui.info(x) 
    })
  }
}
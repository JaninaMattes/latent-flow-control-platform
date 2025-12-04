import { Component } from '@angular/core';

@Component({
  selector: 'app-slider-thumb',
  templateUrl: './slider-thumb.component.html',
  styleUrls: ['./slider-thumb.component.sass']
})
export class SliderThumbComponent  {

  constructor() { }

  formatLabel(value: number): string {
    if (value >= 10) {
      return Math.round(value / 10) + 'steps';
    }

    return `${value}`;
  }

}

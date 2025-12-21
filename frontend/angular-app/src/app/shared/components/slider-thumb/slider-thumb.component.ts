import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-slider-thumb',
  templateUrl: './slider-thumb.component.html',
  styleUrls: ['./slider-thumb.component.sass'],
})
export class SliderThumbComponent {
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() step: number = 1;
  @Input() sliderValue: number = 50;
  @Input() label: string = '';
  @Input() unit: string = '%';
  @Input() showTickMarks: boolean = true;
  @Input() discrete: boolean = true;
  @Input() showValue: boolean = true;

  @Output() valueChange = new EventEmitter<number>();

  sliderId: string = this.label;

  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + `${this.unit}`;
    }
    return `${value}`;
  }

  onValueChange(newValue: number): void {
    this.sliderValue = newValue;
    this.valueChange.emit(newValue);
  }
}

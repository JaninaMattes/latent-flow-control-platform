import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-image-card-view',
  templateUrl: './image-card-view.component.html',
  styleUrls: ['./image-card-view.component.sass'],
})
export class ImageCardViewComponent {
  @Input() id!: string;
  @Input() picture!: string;
  @Input() isSelected = false;

  @Output() selectionChange = new EventEmitter<{
    id: string;
    selected: boolean;
  }>();

  public toggleSelection(event: Event): void {
    event.stopPropagation();
    this.selectionChange.emit({
      id: this.id,
      selected: !this.isSelected,
    });
  }
}

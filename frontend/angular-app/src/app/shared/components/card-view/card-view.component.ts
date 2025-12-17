import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.sass'],
})
export class CardViewComponent {
  @Input() id!: string;
  @Input() picture!: string;
  @Input() createdAt!: Date;
  @Input() likes!: number;
  @Input() isLiked = false;

  @Output() likeChanged = new EventEmitter<{ id: string; liked: boolean }>();

  public toggleLike(event: Event): void {
    event.stopPropagation();
    this.isLiked = !this.isLiked;
    
    this.likeChanged.emit({
      id: this.id,
      liked: this.isLiked,
    });
  }
}
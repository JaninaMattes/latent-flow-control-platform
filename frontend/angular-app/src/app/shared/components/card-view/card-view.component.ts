import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardViewComponent {
  @Input() id!: string;
  @Input() picture!: string;
  @Input() createdAt!: Date;
  @Input() likes!: number;
  @Input() isLiked = false;

  @Output() likedToggled = new EventEmitter<{ id: string; liked: boolean }>();

  public toggleLike(event: Event): void {
    event.stopPropagation();
    this.likedToggled.emit({
      id: this.id,
      liked: !this.isLiked,
    });
  }
}

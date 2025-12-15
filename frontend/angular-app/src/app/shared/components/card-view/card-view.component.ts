import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.sass']
})
export class CardViewComponent {
  @Input() picture!: string;
  @Input() createdAt!: string;
  @Input() likes!: number;

  isLiked = false;

  toggleLike(event: Event) {
    event.stopPropagation(); // prevent parent clicks

    this.isLiked = !this.isLiked;
    this.likes += this.isLiked ? 1 : -1;
  }
}

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

  liked = false;

  toggleLike(event: Event) {
    event.stopPropagation(); // prevent parent clicks

    this.liked = !this.liked;
    this.likes += this.liked ? 1 : -1;
  }
}

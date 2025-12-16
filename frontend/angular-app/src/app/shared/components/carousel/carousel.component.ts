import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ImageContent } from 'src/app/models/image-content.model';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.sass'],
})
export class CarouselComponent implements AfterViewInit {
  @Input() images: ImageContent[] = [];
  @Input() selectedImages: string[] = [];

  @Output() selectionChange = new EventEmitter<{
    id: string;
    selected: boolean;
  }>();

  @ViewChild('track', { static: true }) track!: ElementRef;
  @ViewChild('viewport', { static: true }) viewport!: ElementRef;

  cardWidth: number = 150; // default, can be updated from DOM
  gap: number = 16;         
  currentIndex: number = 0;

  get transform(): string {
    return `translateX(-${this.currentIndex * (this.cardWidth + this.gap)}px)`;
  }

  ngAfterViewInit(): void {
    // Read actual width from the DOM
    const firstCard = this.track.nativeElement.querySelector('.image-card');
    if (firstCard) {
      this.cardWidth = firstCard.offsetWidth;
    }
  }

  nextSlide(): void {
    const visibleCount = Math.floor(
      this.viewport.nativeElement.offsetWidth / (this.cardWidth + this.gap)
    );
    const maxIndex = this.images.length - visibleCount;
    if (this.currentIndex < maxIndex) {
      this.currentIndex++;
    }
  }

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  onSelectionChange(event: { id: string; selected: boolean }): void {
    if (event.selected) {
      if (!this.selectedImages.includes(event.id)) {
        this.selectedImages = [...this.selectedImages, event.id];
      }
    } else {
      this.selectedImages = this.selectedImages.filter((id) => id !== event.id);
    }
    this.selectionChange.emit({ id: event.id, selected: event.selected });
  }
}

import { Component } from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.sass']
})
export class CarouselComponent {

  // Dummy image samples
  images = [
    { name: 'Image 1', url: 'assets/images/dummy/img1.png' },
    { name: 'Image 2', url: 'assets/images/dummy/img1.png' },
    { name: 'Image 3', url: 'assets/images/dummy/img1.png' },
    { name: 'Image 4', url: 'assets/images/dummy/img1.png' },
    { name: 'Image 5', url: 'assets/images/dummy/img1.png' },
  ];

  selectedImages: any[] = [];

  toggleSelection(img: any) {
    if (this.isSelected(img)) {
      this.selectedImages = this.selectedImages.filter(i => i !== img);
    } else if (this.selectedImages.length < 2) {
      this.selectedImages.push(img);
    }
  }

  isSelected(img: any): boolean {
    return this.selectedImages.includes(img);
  }

  confirmSelection() {
    console.log('Selected images:', this.selectedImages);
    // TODO: emit to parent or navigate
  }
}

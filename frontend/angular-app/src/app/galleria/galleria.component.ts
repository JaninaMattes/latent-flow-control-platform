// galleria.component.ts
import { Component, OnInit } from '@angular/core';
import { GalleriaService } from '../shared/services/galleria.service';
import { IGalleriaImageContent } from '../models/image-content.model';

@Component({
  selector: 'app-galleria',
  templateUrl: './galleria.component.html',
  styleUrls: ['./galleria.component.sass']
})
export class GalleriaComponent implements OnInit {

  images: IGalleriaImageContent[] = [];
  private readonly FETCH_IMG_LIMIT = 20;
  private readonly FETCH_IMG_OFFSET = 0;

  constructor(private readonly galleriaService: GalleriaService) {}

  ngOnInit(): void {
    this.fetchImages();
  }

  fetchImages(): void {
    this.galleriaService.getGeneratedImages(this.FETCH_IMG_LIMIT, this.FETCH_IMG_OFFSET).subscribe({
      next: (data) => this.images = data,
      error: (err) => console.error('Error fetching images:', err)
    });
  }
}

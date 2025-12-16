// galleria.component.ts
import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { GalleriaService } from '../shared/services/galleria.service';
import { IGalleriaImageContent } from '../models/image-content.model';
@Component({
  selector: 'app-galleria',
  templateUrl: './galleria.component.html',
  styleUrls: ['./galleria.component.sass'],
})
export class GalleriaComponent implements OnInit {
  images: IGalleriaImageContent[] = [];
  cols: number = 2;

  constructor(
    private readonly galleriaService: GalleriaService,
    private readonly breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.setupGrid();
    this.fetchImages();
  }

  public handleLike(event: { id: string; liked: boolean }) {
    const img = this.images.find((i) => i.id === event.id);
    if (!img) return;

    // increment likes
    img.likedBy += event.liked ? 1 : -1;
    this.galleriaService.updateImage(img);
  }

  private setupGrid(): void {
    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
      ])
      .subscribe((result) => {
        this.cols = result.breakpoints[Breakpoints.XSmall]
          ? 1
          : result.breakpoints[Breakpoints.Small]
          ? 2
          : result.breakpoints[Breakpoints.Medium]
          ? 3
          : 4;
      });
  }

  private fetchImages(): void {
    this.galleriaService.getGeneratedImages(20, 0).subscribe({
      next: (data) => (this.images = data),
      error: (err) => console.error(err),
    });
  }
}

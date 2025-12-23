// galleria.component.ts
import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { GalleriaService } from '../shared/services/galleria.service';
import {
  IGalleriaImageContent,
  ImageFrame,
  IUpdateGalleriaImage,
} from '../models/image-content.model';
import { LoadingService } from '../shared/services/spinner-loader.service';
import { catchError, finalize, of, tap } from 'rxjs';
@Component({
  selector: 'app-galleria',
  templateUrl: './galleria.component.html',
  styleUrls: ['./galleria.component.sass'],
})
export class GalleriaComponent implements OnInit {
  private static readonly LIMIT = 20;
  private static readonly OFFSET = 0;
  cols: number = 2;

  // Selection of images
  images: IGalleriaImageContent[] = [];

  constructor(
    private readonly galleriaService: GalleriaService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly loadingService: LoadingService
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
    const updateImg: IUpdateGalleriaImage = {
      id: img.id,
      likedBy: img.likedBy,
    };
    this.loadingService.startLoading();
    this.galleriaService
      .updateImageLikes(updateImg)
      .pipe(
        tap((data) => {
          const foundIndex = this.images.findIndex((x) => x.id === data.id);
          if (foundIndex !== -1) {
            this.images[foundIndex] = data;
          }
        }),
        catchError((err) => {
          console.error('Error updating images for Galleria', err);
          return of([] as IGalleriaImageContent[]);
        }),
        finalize(() => { 
          this.loadingService.stopLoading();
        })
      )
      .subscribe();
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
    this.loadingService.startLoading();
    this.galleriaService
      .getGeneratedImages(GalleriaComponent.LIMIT, GalleriaComponent.OFFSET)
      .pipe(
        tap((data) => (this.images = data)),
        catchError((err) => {
          console.error('Error loading images for Galleria', err);
          return of([] as ImageFrame[]);
        }),
        finalize(() => {
          this.loadingService.stopLoading();
        })
      )
      .subscribe();
  }
}

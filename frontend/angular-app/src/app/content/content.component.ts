import { Component, inject, OnInit } from '@angular/core';
import { ContentService } from '../shared/services/content.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import {
  ImageContent,
  InterpolationState,
} from '../models/image-content.model';
import { take } from 'rxjs';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.sass'],
})
export class ContentComponent implements OnInit {
  readonly dialog = inject(MatDialog);

  interpolationState: InterpolationState | null = null;
  selectedImageIds: string[] = [];
  selectedImages: ImageContent[] = [];

  interpolationValue = 50;

  // ✅ Dummy placeholders (typed correctly)
  resultImgUrl: string | null = null;
  resultGifUrl: string | null = null;

  isPlayingGif = false;
  private inactivityTimer?: ReturnType<typeof setTimeout>;

  constructor(private readonly contentService: ContentService) {}

  ngOnInit(): void {
    this.fetchSampleImages();
  }

  public onInterpolationChange(value: number): void {
    this.interpolationValue = value;
    this.isPlayingGif = false;

    this.requestStillFrame(value);
    this.restartInactivityTimer();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '90vw',
      disableClose: true,
      data: {},
      panelClass: 'auto-width-dialog',
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (!result) return;

        const { selectedImages } = result;
        this.fetchSelectedImages(selectedImages);
      });
  }

  playGif(): void {
    this.isPlayingGif = true;
    clearTimeout(this.inactivityTimer);
  }

  private restartInactivityTimer(): void {
    clearTimeout(this.inactivityTimer);

    this.inactivityTimer = setTimeout(() => {
      this.isPlayingGif = true;
    }, 3000);
  }

  private fetchSelectedImages(selectedIds: string[]): void {
    this.contentService.getImagesById(selectedIds).subscribe({
      next: (data) => {
        this.selectedImages = data;

        // Reset state when new images are selected
        this.interpolationValue = 50;
        this.isPlayingGif = false;

        // TODO: Remove dummy assets
        this.resultGifUrl =
          'https://cdn.pixabay.com/animation/2025/11/07/14/36/14-36-21-988_512.gif';

        this.requestStillFrame(this.interpolationValue);
      },
      error: (err) => console.log('Failed to fetch selected images', err),
    });
  }

  /**
   * Dummy still-frame generator
   * Later replaced by backend request
   */
  private requestStillFrame(value: number): void {
    // TODO: Remove dummy assets
    this.resultImgUrl = `https://cdn.pixabay.com/photo/2017/08/18/13/04/glass-2654887_${value}jpg`;
  }
  
  private fetchSampleImages(): void {
    //TODO: Fix
    // this.contentService;
  }

  /**
   * Instead of frequent loads, store in browser and fetch once
   * to reduce network calls to backend.
   * @param baseUrl
   * @param frameCount
   * @returns
   */
  private preloadImageFrames(baseUrl: string, frameCount: number): string[] {
    const frames: string[] = [];
    for (let i = 0; i < frameCount; i++) {
      const url = `${baseUrl}${i}.png`;
      const img = new Image();
      img.src = url; // store in browser cache
      frames.push(url);
    }
    return frames;
  }

  get currentFrameUrl(): string | null {
    return (
      this.interpolationState?.frames[this.interpolationState.currentIndex] ||
      null
    );
  }

  onSliderChange(value: number) {
    if (!this.interpolationState) return;
    this.interpolationState.currentIndex = value;
    this.isPlayingGif = false;
  }
}

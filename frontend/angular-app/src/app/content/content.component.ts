import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Subject,
  tap,
  switchMap,
  animationFrames,
  takeUntil,
  timer,
  catchError,
  of,
  take,
} from 'rxjs';
import { ImageContent, ImageFrame } from '../models/image-content.model';
import { ContentService } from '../shared/services/content.service';
import { InterpolationService } from '../shared/services/interpolation.service';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.sass'],
})
export class ContentComponent implements OnInit, OnDestroy {
  readonly dialog = inject(MatDialog);

  private static readonly SLIDER_MIN = 0;
  private static readonly SLIDER_MAX = 100;
  private static readonly DEFAULT_FRAMES = 20;
  private static readonly AUTO_PLAY_DELAY_MS = 3000;
  private static readonly ANIMATION_DURATION_MS = 1500;

  private readonly destroy$ = new Subject<void>();
  private readonly play$ = new Subject<void>();
  private readonly stop$ = new Subject<void>();
  private readonly inactivity$ = new Subject<void>();

  isPlayingGif = false;

  selectedImageIds: string[] = []; // User selected image Ids 
  firstSelectedImage: ImageContent | null = null; 
  secondSelectedImage: ImageContent | null = null; 
  interpolationFrames: ImageFrame[] = []; 
  interpolationState: ImageFrame | null = null;
  currentSliderValue = 50;

  constructor(
    private readonly contentService: ContentService,
    private readonly interpolationService: InterpolationService
  ) {}

  ngOnInit(): void {
    this.setupImages();
    this.setupAutoPlay();
    this.setupAnimation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ----------------------------
  // Animation
  // ----------------------------

  private setupAnimation(): void {
    this.play$
      .pipe(
        tap(() => (this.isPlayingGif = true)),
        switchMap(() =>
          animationFrames().pipe(
            takeUntil(this.stop$),
            takeUntil(this.destroy$)
          )
        )
      )
      .subscribe(({ elapsed }) => {
        if (!this.interpolationFrames.length) return;

        const progress =
          (elapsed % ContentComponent.ANIMATION_DURATION_MS) /
          ContentComponent.ANIMATION_DURATION_MS;

        const index = Math.floor(progress * this.interpolationFrames.length);

        this.interpolationState = this.interpolationFrames[index];
      });

    this.stop$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => (this.isPlayingGif = false));
  }

  private setupImages(): void {
    const selectedDefaultIds: string[] = ['0', '1']; // TODO: Update logic 
    this.fetchSelectedImages( selectedDefaultIds, ContentComponent.DEFAULT_FRAMES );
  }

  // ----------------------------
  // Auto-play on inactivity
  // ----------------------------

  private setupAutoPlay(): void {
    this.inactivity$
      .pipe(
        switchMap(() => timer(ContentComponent.AUTO_PLAY_DELAY_MS)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.play$.next());
  }

  // ----------------------------
  // Public UI handlers
  // ----------------------------

  playGif(): void {
    this.play$.next();
  }

  stopGif(): void {
    this.stop$.next();
    this.inactivity$.next();
  }

  onSliderChange(value: number): void {
    this.currentSliderValue = value;

    if (!this.isPlayingGif) {
      this.computeInterpolation(value);
    }

    this.inactivity$.next();
  }

  /** * Open dialog for image selection. */ openDialog(): void {
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
        this.fetchSelectedImages(
          selectedImages,
          ContentComponent.DEFAULT_FRAMES
        );
      });
  }

  private computeInterpolation(sliderValue: number): void {
    this.interpolationState = this.interpolationService.getInterpolatedFrame(
      this.interpolationFrames,
      sliderValue,
      ContentComponent.SLIDER_MIN,
      ContentComponent.SLIDER_MAX
    );
  }

  private fetchSelectedImages(
    selectedIds: string[],
    numberOfFrames: number
  ): void {
    this.contentService
      .loadSelectedImages(selectedIds)
      .pipe(
        tap((data) => {
          this.firstSelectedImage = data[0] ?? null;
          this.secondSelectedImage = data[1] ?? null;
        }),
        switchMap(() =>
          this.interpolationService.loadInterpolationFrames(
            selectedIds,
            numberOfFrames
          )
        ),
        catchError((err) => {
          console.error(err);
          return of([] as ImageFrame[]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((frames) => {
        this.interpolationFrames = frames;
        this.computeInterpolation(this.currentSliderValue);
      });
  }
}

// interpolation.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ImageFrame } from 'src/app/models/image-content.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InterpolationService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieve a single image based on its frame ID.
   * @param frameIndex
   * @returns
   */
  public getFrames(
    selectedIds: string[],
    numberOfFrames: number
  ): Observable<ImageFrame[]> {
    const params = {
      ids: selectedIds.join(','),
      numberOfFrames: numberOfFrames,
    };

    return this.http.get<ImageFrame[]>(
      `${environment.apiUrl}/content/interpolation`,
      { params, withCredentials: true }
    );
  }

  /**
   * As slider values and frames follow different
   * scales, the computation of a slope value allows
   * for linear transformation into a justified scale.
   * @param yStart
   * @param yEnd
   * @param xStart
   * @param xEnd
   * @returns
   */
  public computeSliderSlope(
    yStart: number,
    yEnd: number,
    xStart: number,
    xEnd: number
  ): number {
    // Normalize and pre-compute slope
    return (yEnd - yStart) * (1 / (xEnd - xStart));
  }

  /**
   * Compute frame index based on normalized
   * slider value and amount of available frames.
   * @param yStart
   * @param xStart
   * @param inputValue
   * @param sliderValueSlope
   * @returns
   */
  public getFrameIndex(
    yStart: number,
    xStart: number,
    inputValue: number,
    sliderValueSlope: number
  ): number {
    let frameIndex: number = 0;
    if (sliderValueSlope != 0) {
      frameIndex = Math.round(yStart + sliderValueSlope * (inputValue - xStart));
    }
    console.log(`Found frame index ${frameIndex}`);
    return frameIndex;
  }

  /**
   * Retrieve the linearly transformed correct 
   * frame of the interpolation.
   * @param frames
   * @param sliderValue
   * @param sliderValueSlope
   * @param sliderStartValue
   * @param firstFrame
   * @returns
   */
  public getInterpolatedFrame(
    frames: ImageFrame[],
    sliderValue: number,
    sliderValueSlope: number,
    sliderStartValue = 0,
    firstFrame = 0
  ): ImageFrame | null {
    let frameIndex: number = this.getFrameIndex(
      sliderStartValue,
      firstFrame, // first frame index
      sliderValueSlope,
      sliderValue
    );

    console.log(`Found index ${frameIndex}`);
    return frames[frameIndex];
  }
}

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
  public loadInterpolationFrames(
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
   * Retrive correct frame using linear transformation
   * between slider range and available frame range.
   * @param frames
   * @param sliderValue
   * @param sliderMin
   * @param sliderMax
   * @returns
   */
  public getInterpolatedFrame(
    frames: ImageFrame[],
    sliderValue: number,
    sliderMin = 0,
    sliderMax = 100
  ): ImageFrame | null {
    if (!frames.length) return null;

    const clampedSlider = Math.min(Math.max(sliderValue, sliderMin), sliderMax);

    const frameCount = frames.length;
    const normalized = (clampedSlider - sliderMin) / (sliderMax - sliderMin);

    const frameIndex = Math.round(normalized * (frameCount - 1));

    return frames[frameIndex];
  }
}

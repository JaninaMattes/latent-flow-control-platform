// galleria.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ImageCategory,
  ImageContent,
  ImageFrame,
} from 'src/app/models/image-content.model';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieve a single image based on its frame ID.
   * @param frameIndex
   * @returns
   */
  public getSamplesPerFrame(
    selectedIds: string[],
    frameIndex: number
  ): Observable<ImageFrame> {
    const params = {
      ids: selectedIds.join(','),
      frameIndex: frameIndex.toString(),
    };

    return this.http.get<ImageFrame>(
      `${environment.apiUrl}/content/interpolations`,
      { params, withCredentials: true }
    );
  }

  /**
   * Fetch all possible categories.
   * @returns
   */
  public getAllCategories(): Observable<ImageCategory[]> {
    return this.http.get<ImageCategory[]>(
      `${environment.apiUrl}/content/categories`,
      { withCredentials: true }
    );
  }

  /**
   * Fetch all images for a specific category.
   * @param categoryId
   * @returns
   */
  public getAllImagesByCategory(categoryId: string) {
    return this.http.get<ImageContent[]>(
      `${environment.apiUrl}/content/categories/${categoryId}/images`,
      { withCredentials: true }
    );
  }

  /**
   * Retrieve a selection of images, e.g. 2 for interpolation.
   * @param selectedIds
   * @returns
   */
  public getImagesById(selectedIds: string[]): Observable<ImageContent[]> {
    const params = { ids: selectedIds.join(',') };
    return this.http.get<ImageContent[]>(
      `${environment.apiUrl}/content/images`,
      { params, withCredentials: true }
    );
  }
}

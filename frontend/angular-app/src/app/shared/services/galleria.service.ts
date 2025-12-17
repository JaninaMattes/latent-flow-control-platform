// galleria.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  IGalleriaImageContent,
  IUpdateGalleriaImage,
} from 'src/app/models/image-content.model';

@Injectable({
  providedIn: 'root',
})
export class GalleriaService {
  constructor(private readonly http: HttpClient) {}

  public getGeneratedImages(
    limit = 10,
    offset = 0
  ): Observable<IGalleriaImageContent[]> {
    return this.http.get<IGalleriaImageContent[]>(
      `${environment.apiUrl}/gallery/content?limit=${limit}&offset=${offset}`,
      { withCredentials: true }
    );
  }

  public updateImageLikes(
    updateImg: IUpdateGalleriaImage
  ): Observable<IGalleriaImageContent> {
    return this.http.patch<IGalleriaImageContent>(
      `${environment.apiUrl}/gallery/content/likes`,
      updateImg, 
      { withCredentials: true }
    );
  }
}

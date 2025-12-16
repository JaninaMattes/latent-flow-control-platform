// galleria.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IGalleriaImageContent } from 'src/app/models/image-content.model';


@Injectable({
  providedIn: 'root',
})
export class GalleriaService {

  constructor(private readonly http: HttpClient) {}

  public getGeneratedImages(limit = 10, offset = 0): Observable<IGalleriaImageContent[]> {
    return this.http.get<IGalleriaImageContent[]>(
      `${environment.apiUrl}/gallery/gen-content?limit=${limit}&offset=${offset}`,
      { withCredentials: true }
    );
  }

  // TODO: Connect to backend
  public updateImage(img: IGalleriaImageContent) {
    throw new Error('Method not implemented.');
  }
}

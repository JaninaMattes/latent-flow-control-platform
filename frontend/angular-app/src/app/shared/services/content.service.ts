// galleria.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  IGalleriaImageCategory,
  ImageContent,
} from 'src/app/models/image-content.model';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  constructor(private readonly http: HttpClient) {}

  public getAllCategories(): Observable<IGalleriaImageCategory[]> {
    return this.http.get<IGalleriaImageCategory[]>(
      `${environment.apiUrl}/gallery/categories`,
      { withCredentials: true }
    );
  }

  public getAllImagesByCategory(categoryId: string) {
    return this.http.get<ImageContent[]>(
      `${environment.apiUrl}/gallery/categories/${categoryId}/images`,
      { withCredentials: true }
    );
  }
}

// src/app/galleria/galleria.service.ts
export interface IGalleriaImageContent {
  id: string;
  picture: string; // URL to S3 or CDN
  createdAt: Date;
  likedBy: number;
}

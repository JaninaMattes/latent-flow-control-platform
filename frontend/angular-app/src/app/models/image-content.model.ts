// src/app/galleria/galleria.service.ts
export interface IGalleriaImageContent {
  id: string;
  picture: string; // URL to S3 or CDN
  createdAt: Date;
  likedBy: number;
}

export interface IUpdateGalleriaImage {
  id: string;
  likedBy: number;
}


export interface IGalleriaImageCategory {
  id: string;
  category: string;
}


export interface ImageContent {
  id: string;
  picture: string; // URL to S3 or CDN
  category: string;
}
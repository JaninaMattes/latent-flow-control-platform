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


export interface ImageCategory {
  id: string;
  category: string;
}


export interface ImageContent {
  id: string;
  picture: string; // URL to S3 or CDN
  category: string;
}

export interface ImageFrame {
  id: string;
  frameIndex: number;
  picture: string; // URL to S3 or CDN
  parentImageIds: string[];
}

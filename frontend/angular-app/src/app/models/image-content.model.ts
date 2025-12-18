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
  id: string,
  frameCount: number;
  baseUrl?: string
}

export interface InterpolationState {
  frames: string[];        // ordered frame URLs
  currentIndex: number;    // slider-controlled
  gifUrl?: string;         // optional autoplay Gif
}

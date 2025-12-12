import { Injectable } from '@nestjs/common';
import { ImageContentDto } from './dto/image-content.dto';

@Injectable()
export class GalleryService {
  private readonly mockImages: ImageContentDto[] = [
    {
      id: '1',
      picture: 'https://cdn.pixabay.com/photo/2025/10/24/11/12/tree-9913930_1280.jpg',
      createdAt: new Date().toISOString(),
      likedBy: 42, // meaning of life
    },
    {
      id: '2',
      picture: 'https://cdn.pixabay.com/photo/2025/08/11/15/04/milky-way-9768540_1280.jpg',
      createdAt: new Date().toISOString(),
      likedBy: 35,
    },
    {
      id: '3',
      picture: 'https://cdn.pixabay.com/photo/2025/11/28/16/07/frost-9983255_1280.jpg',
      createdAt: new Date().toISOString(),
      likedBy: 18,
    },
        {
      id: '4',
      picture: 'https://cdn.pixabay.com/photo/2025/11/28/16/07/frost-9983255_1280.jpg',
      createdAt: new Date().toISOString(),
      likedBy: 18,
    },
        {
      id: '5',
      picture: 'https://cdn.pixabay.com/photo/2025/11/28/16/07/frost-9983255_1280.jpg',
      createdAt: new Date().toISOString(),
      likedBy: 18,
    },
        {
      id: '6',
      picture: 'https://cdn.pixabay.com/photo/2025/11/28/16/07/frost-9983255_1280.jpg',
      createdAt: new Date().toISOString(),
      likedBy: 18,
    },
        {
      id: '7',
      picture: 'https://cdn.pixabay.com/photo/2025/11/28/16/07/frost-9983255_1280.jpg',
      createdAt: new Date().toISOString(),
      likedBy: 18,
    },
  ];

  async getGeneratedImages(): Promise<ImageContentDto[]> {
    // Later: fetch from DB or S3
    return this.mockImages;
  }
}

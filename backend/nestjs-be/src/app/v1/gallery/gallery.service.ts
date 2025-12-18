import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  ImageContentDto,
  UpdateImageContentDto,
} from './dto/image-gallery.dto';

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);
  private readonly mockGeneratedImages: ImageContentDto[] = [
    {
      id: '1',
      picture:
        'https://cdn.pixabay.com/photo/2025/10/24/11/12/tree-9913930_1280.jpg',
      createdAt: new Date().toISOString(),
      likedBy: 42, // meaning of life
    },
    {
      id: '2',
      picture:
        'https://cdn.pixabay.com/photo/2025/08/11/15/04/milky-way-9768540_1280.jpg',
      createdAt: new Date().toISOString(),
      likedBy: 35,
    },
    {
      id: '3',
      picture:
        'https://cdn.pixabay.com/photo/2021/11/11/09/12/lighthouse-6785763_1280.jpg',
      createdAt: new Date().toISOString(),
      likedBy: 18,
    },
    {
      id: '4',
      picture:
        'https://cdn.pixabay.com/photo/2025/11/28/16/07/frost-9983255_1280.jpg',
      createdAt: new Date().toISOString(),
      likedBy: 32,
    },
    {
      id: '5',
      picture:
        'https://cdn.pixabay.com/photo/2025/12/10/08/38/ash-10005812_1280.jpg',
      createdAt: new Date().toISOString(),
      likedBy: 1,
    },
    {
      id: '6',
      picture:
        'https://cdn.pixabay.com/photo/2025/10/24/11/12/tree-9913930_1280.jpg',
      createdAt: new Date().toISOString(),
      likedBy: 8,
    },
    {
      id: '7',
      picture:
        'https://cdn.pixabay.com/photo/2024/11/18/10/19/europe-9205818_1280.jpg',
      createdAt: new Date().toISOString(),
      likedBy: 34,
    },
    {
      id: '8',
      picture:
        'https://cdn.pixabay.com/photo/2024/05/20/16/50/landscape-8775773_1280.jpg',
      createdAt: new Date().toISOString(),
      likedBy: 56,
    },
  ];

  /**
   * Get generated images (with pagination).
   * In the future: replace with DB/S3 query.
   */
  async getGeneratedImages(
    limit: number,
    offset: number,
  ): Promise<ImageContentDto[]> {
    this.logger.verbose(`Fetching images limit=${limit}, offset=${offset}`);

    // Pagination logic (safe)
    const start = Math.max(offset, 0);
    const end =
      limit > 0
        ? Math.min(start + limit, this.mockGeneratedImages.length)
        : this.mockGeneratedImages.length;

    return this.mockGeneratedImages.slice(start, end);
  }

  /**
   * Update likes for generated images.
   * @param updateImg
   * @returns
   */
  async updateImageLikes(
    updateImg: UpdateImageContentDto,
  ): Promise<ImageContentDto> {
    const index = this.mockGeneratedImages.findIndex(
      (img) => img.id === updateImg.id,
    );

    if (index === -1) {
      // Image doesn't exist
      throw new NotFoundException(`Image with id ${updateImg.id} not found`);
    }

    if (updateImg.likedBy !== undefined) {
      this.mockGeneratedImages[index].likedBy = updateImg.likedBy;
    }

    return this.mockGeneratedImages[index];
  }
}

import { Injectable, Logger } from '@nestjs/common';
import {
  CategoryDto,
  ImageContentDto,
  ImageDto,
} from './dto/image-content.dto';

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
      picture: 'https://pixabay.com/images/download/x-9985148_1920.jpg',
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
      picture: 'https://pixabay.com/images/download/x-7646958_1920.jpg',
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

  private readonly mockCategories: CategoryDto[] = [
    {
      id: '1',
      category: 'Tiger',
    },
    {
      id: '2',
      category: 'Snow Leopard',
    },
    {
      id: '3',
      category: 'Lion',
    },
    {
      id: '4',
      category: 'Leopard',
    },
    {
      id: '5',
      category: 'Lorikeet',
    },
    {
      id: '6',
      category: 'Cockatoo',
    },
  ];

  private readonly mockRealImagesByCategory: ImageDto[] = [
    {
      id: '0',
      picture:
        'https://cdn.pixabay.com/photo/2018/01/21/09/56/tiger-3096211_1280.jpg',
      categoryId: '1',
    },
    {
      id: '1',
      picture:
        'https://cdn.pixabay.com/photo/2018/01/21/09/56/tiger-3096211_1280.jpg',
      categoryId: '1',
    },
    {
      id: '2',
      picture:
        'https://cdn.pixabay.com/photo/2018/01/21/09/56/tiger-3096211_1280.jpg',
      categoryId: '1',
    },
    {
      id: '3',
      picture:
        'https://cdn.pixabay.com/photo/2018/01/21/09/56/tiger-3096211_1280.jpg',
      categoryId: '1',
    },
    {
      id: '4',
      picture:
        'https://cdn.pixabay.com/photo/2018/01/21/09/56/tiger-3096211_1280.jpg',
      categoryId: '1',
    },
    {
      id: '5',
      picture:
        'https://cdn.pixabay.com/photo/2015/04/16/10/22/snow-leopard-725384_1280.jpg',
      categoryId: '2',
    },
    {
      id: '6',
      picture:
        'https://cdn.pixabay.com/photo/2018/03/16/00/45/leopard-3229940_1280.jpg',
      categoryId: '2',
    },
    {
      id: '7',
      picture:
        'https://cdn.pixabay.com/photo/2015/09/09/08/40/snow-leopard-931222_1280.jpg',
      categoryId: '2',
    },
    {
      id: '8',
      picture:
        'https://cdn.pixabay.com/photo/2015/09/09/08/40/snow-leopard-931222_1280.jpg',
      categoryId: '3',
    },
    {
      id: '9',
      picture:
        'https://cdn.pixabay.com/photo/2015/09/09/08/40/snow-leopard-931222_1280.jpg',
      categoryId: '3',
    },
    {
      id: '10',
      picture:
        'https://cdn.pixabay.com/photo/2015/09/09/08/40/snow-leopard-931222_1280.jpg',
      categoryId: '4',
    },
    {
      id: '11',
      picture:
        'https://cdn.pixabay.com/photo/2015/09/09/08/40/snow-leopard-931222_1280.jpg',
      categoryId: '5',
    },
    {
      id: '12',
      picture:
        'https://cdn.pixabay.com/photo/2015/09/09/08/40/snow-leopard-931222_1280.jpg',
      categoryId: '6',
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
   * Get all image categories available.
   */
  async getImageCategories(): Promise<CategoryDto[]> {
    return [...this.mockCategories].sort(function (a, b) {
      let nameA = a.category.toLowerCase(),
        nameB = b.category.toLowerCase();
      if (nameA < nameB)
        //sort string ascending
        return -1;
      if (nameA > nameB) return 1;
      return 0; //default return value (no sorting)
    });
  }

  /**
   * Get all images based on a specific category.
   * @param category
   * @returns
   */
  async getImagesByCategory(categoryId: string): Promise<ImageDto[]> {
    let filteredImgs: ImageDto[] = this.mockRealImagesByCategory.filter(
      (image) => image.categoryId === categoryId,
    );
    return filteredImgs;
  }

  async getImagesByIds(selectedImgIds: string[]): Promise<ImageDto[]> {
    if (!selectedImgIds || selectedImgIds.length === 0) {
      this.logger.warn(`Received no selected image ids.`);
      return [];
    }

    const filteredImgs: ImageDto[] = this.mockRealImagesByCategory.filter(
      (image) => selectedImgIds.includes(image.id),
    );

    return filteredImgs;
  }
}

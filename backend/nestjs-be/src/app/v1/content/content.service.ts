import { Injectable, Logger } from '@nestjs/common';
import { CategoryDto, ImageDto, ImageFrameDto } from './dto/image-content.dto';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

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
        'https://cdn.pixabay.com/photo/2015/09/09/08/40/snow-leopard-931222_1280.jpg',
      categoryId: '2',
    },
    {
      id: '6',
      picture:
        'https://cdn.pixabay.com/photo/2015/09/09/08/40/snow-leopard-931222_1280.jpg',
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
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
      categoryId: '6',
    },
    {
      id: '13',
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
      categoryId: '6',
    },
    {
      id: '14',
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
      categoryId: '6',
    },
    {
      id: '15',
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
      categoryId: '6',
    },
    {
      id: '16',
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
      categoryId: '6',
    },
  ];

  private readonly mockSampleImages: ImageDto[] = [
    {
      id: '0',
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
      categoryId: '6',
    },
    {
      id: '1',
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
      categoryId: '6',
    },
    {
      id: '3',
      picture:
        'https://cdn.pixabay.com/animation/2025/08/06/06/37/06-37-33-94_512.gif',
      categoryId: '6',
    },
  ];

  private readonly mockSampleFrames: ImageFrameDto[] = [
    {
      id: '0',
      frameCount: 0,
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
    },
    {
      id: '0',
      frameCount: 1,
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
    },
    {
      id: '0',
      frameCount: 2,
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
    },
    {
      id: '0',
      frameCount: 3,
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
    },
    {
      id: '0',
      frameCount: 4,
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
    },
    {
      id: '0',
      frameCount: 5,
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
    },
    {
      id: '0',
      frameCount: 6,
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
    },
    {
      id: '0',
      frameCount: 7,
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
    },
    {
      id: '0',
      frameCount: 8,
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
    },
    {
      id: '0',
      frameCount: 9,
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
    },
    {
      id: '0',
      frameCount: 10,
      picture:
        'https://cdn.pixabay.com/photo/2025/10/27/13/18/kitten-9920257_1280.jpg',
    },
  ];

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
   * Get images by their selected IDs.
   * @param selectedImgIds
   * @returns
   */
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

  /**
   * Fetch a single frame based on the requested frame count number.
   * @param requestedFrame
   * @returns
   */
  async getSamplePerFrame(frameCount: number): Promise<ImageFrameDto> {
    const frame = this.mockSampleFrames.find(
      (image) => image.frameCount === frameCount,
    );

    if (!frame) {
      this.logger.warn(`Frame ${frameCount} not found`);
      return null; // or throw NotFoundException
    }

    return frame;
  }
}

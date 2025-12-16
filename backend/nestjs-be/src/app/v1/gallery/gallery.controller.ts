import {
  Controller,
  Get,
  Logger,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JWTAuthGuard } from '../Google-auth/guards/jwt-auth.guard';
import { GalleryService } from './gallery.service';
import {
  CategoryDto,
  ImageContentDto,
  ImageDto,
} from './dto/image-content.dto';

@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  private readonly logger = new Logger(GalleryController.name);

  constructor(private readonly galleryService: GalleryService) {}

  /**
   * Fetches all generated content.
   * @param limit
   * @param offset
   * @returns
   */
  @ApiOperation({ summary: 'Retrieve all generated images.' })
  @ApiResponse({ status: 200, type: [ImageContentDto] })
  @UseGuards(JWTAuthGuard)
  @Get('/gen-content')
  async getAllGeneratedContent(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ): Promise<ImageContentDto[]> {
    this.logger.log(
      `Fetching generated images: limit=${limit}, offset=${offset}`,
    );
    return this.galleryService.getGeneratedImages(
      Number(limit),
      Number(offset),
    );
  }

  /**
   * Fetches all categories of images.
   * @returns
   */
  @ApiOperation({ summary: 'Retrieve all generated images.' })
  @ApiResponse({ status: 200, type: [CategoryDto] })
  @UseGuards(JWTAuthGuard)
  @Get('/categories')
  async getAllCategoriesContent(): Promise<CategoryDto[]> {
    this.logger.log(`Fetching all image categories.`);
    return this.galleryService.getImageCategories();
  }

  /**
   * Fetches all categories of images.
   * @returns
   */
  @ApiOperation({ summary: 'Retrieve all generated images.' })
  @ApiResponse({ status: 200, type: [ImageDto] })
  @UseGuards(JWTAuthGuard)
  @Get('/images')
  async getSelectedImages(@Query('ids') ids: string) {
    console.log('Received ids:', ids);
    const selectedImgIds = ids ? ids.split(',') : [];
    return this.galleryService.getImagesByIds(selectedImgIds);
  }

  /**
   * Fetches all images per category.
   * @returns
   */
  @ApiOperation({ summary: 'Retrieve all images by category ID.' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({ status: 200, type: [ImageDto] })
  @UseGuards(JWTAuthGuard)
  @Get('categories/:categoryId/images')
  async getAllImagesByCategory(
    @Param('categoryId') categoryId: string,
  ): Promise<ImageDto[]> {
    this.logger.log(`Fetching images for category ID: ${categoryId}`);
    return this.galleryService.getImagesByCategory(categoryId);
  }
}

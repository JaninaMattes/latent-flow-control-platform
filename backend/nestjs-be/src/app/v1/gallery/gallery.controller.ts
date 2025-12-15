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
  CategoryImageDto,
  ImageCategoryDto,
  ImageContentDto,
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
  @ApiResponse({ status: 200, type: [ImageCategoryDto] })
  @UseGuards(JWTAuthGuard)
  @Get('/categories')
  async getAllCategoriesContent(): Promise<ImageCategoryDto[]> {
    this.logger.log(`Fetching all image categories.`);
    return this.galleryService.getImageCategories();
  }

  /**
   * Fetches all images per category.
   * @returns
   */
  @ApiOperation({ summary: 'Retrieve all images by category ID.' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({ status: 200, type: [CategoryImageDto] })
  @UseGuards(JWTAuthGuard)
  @Get('categories/:categoryId/images')
  async getAllImagesByCategory(
    @Param('categoryId') categoryId: string,
  ): Promise<CategoryImageDto[]> {
    this.logger.log(`Fetching images for category ID: ${categoryId}`);
    return this.galleryService.getImagesByCategory(categoryId);
  }
}

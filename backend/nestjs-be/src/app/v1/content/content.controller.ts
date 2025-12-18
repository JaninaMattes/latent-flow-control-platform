import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JWTAuthGuard } from '../Google-auth/guards/jwt-auth.guard';
import { CategoryDto, ImageDto } from './dto/image-content.dto';

@Controller('content')
export class ContentController {
  private readonly logger = new Logger(ContentController.name);

  constructor(private readonly contentService: ContentService) {}

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
    return this.contentService.getImageCategories();
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
    return this.contentService.getImagesByCategory(categoryId);
  }

  /**
   * Fetch an image based on its framecount.
   * @returns
   */
  @ApiOperation({ summary: 'Retrieve all images based on their selected IDs.' })
  @ApiResponse({ status: 200, type: [ImageDto] })
  @UseGuards(JWTAuthGuard)
  @Get('/images/samples')
  async getSampleImages() {
    return this.contentService.getSampleImages();
  }

  /**
   * Fetches all images for the selected IDs.
   * @returns
   */
  @ApiOperation({ summary: 'Retrieve all images based on their selected IDs.' })
  @ApiResponse({ status: 200, type: [ImageDto] })
  @UseGuards(JWTAuthGuard)
  @Get('/images')
  async getSelectedImages(@Query('ids') ids: string) {
    this.logger.log(`Fetching images for IDs ${JSON.stringify(ids)}.`);
    const selectedImgIds = ids ? ids.split(',') : [];
    return this.contentService.getImagesByIds(selectedImgIds);
  }
}

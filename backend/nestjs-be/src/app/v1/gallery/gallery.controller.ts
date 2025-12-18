import {
  Controller,
  Get,
  Logger,
  UseGuards,
  Query,
  Body,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JWTAuthGuard } from '../Google-auth/guards/jwt-auth.guard';
import { GalleryService } from './gallery.service';
import {
  ImageContentDto,
  UpdateImageContentDto,
} from './dto/image-gallery.dto';

@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  private readonly logger = new Logger(GalleryController.name);

  constructor(private readonly galleryService: GalleryService) {}

  /**
   * Fetches all generated content from all users.
   * @param limit
   * @param offset
   * @returns
   */
  @ApiOperation({ summary: 'Retrieve all generated images.' })
  @ApiResponse({ status: 200, type: [ImageContentDto] })
  @UseGuards(JWTAuthGuard)
  @Get('/content')
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
   * Update likes of a generated image.
   */
  @ApiOperation({ summary: 'Update likes of a generated image.' })
  @ApiParam({ name: 'imageId', description: 'Image ID' })
  @ApiResponse({ status: 200, type: ImageContentDto })
  @UseGuards(JWTAuthGuard)
  @Patch('content/likes')
  async updateImageLikes(
    @Body() updateImage: UpdateImageContentDto,
  ): Promise<ImageContentDto> {
    return this.galleryService.updateImageLikes(updateImage);
  }
}

import { Controller, Get, Logger, UseGuards, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JWTAuthGuard } from '../Google-auth/guards/jwt-auth.guard';
import { GalleryService } from './gallery.service';
import { ImageContentDto } from './dto/image-content.dto';

@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  private readonly logger = new Logger(GalleryController.name);

  constructor(private readonly galleryService: GalleryService) {}

  @ApiOperation({ summary: 'Retrieve all generated images.' })
  @ApiResponse({ status: 200, type: [ImageContentDto] })
  @UseGuards(JWTAuthGuard)
  @Get('/gen-content')
  async getAllGeneratedContent(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ): Promise<ImageContentDto[]> {
    this.logger.log(`Fetching generated images: limit=${limit}, offset=${offset}`);
    return this.galleryService.getGeneratedImages(Number(limit), Number(offset));
  }
}

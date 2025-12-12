import { Controller, Get, Logger, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation } from '@nestjs/swagger';
import { JWTAuthGuard } from '../Google-auth/guards/jwt-auth.guard';

@Controller('gallery')
export class GalleryController {
  private readonly logger = new Logger(GalleryController.name);

  constructor(private readonly configService: ConfigService) {}

  @ApiOperation({ summary: 'Logout' })
  @UseGuards(JWTAuthGuard)
  @Get('/genai-content')
  async getAllGeneratedContent() {

  }
}

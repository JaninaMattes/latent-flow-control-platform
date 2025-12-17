import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class ImageContentDto {
  @ApiProperty({ description: 'Unique identifier of the generated content' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'URL of the generated image' })
  @IsNotEmpty()
  @IsString()
  picture: string;

  @ApiProperty({ description: 'Creation timestamp', required: false })
  @IsOptional()
  @IsString()
  createdAt?: string;

  @ApiProperty({ description: 'Number of likes', required: false })
  @IsOptional()
  @IsNumber()
  likedBy?: number;
}

export class UpdateImageContentDto {
  @ApiProperty({ description: 'Unique identifier of the generated content' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'Number of likes', required: false })
  @IsOptional()
  @IsNumber()
  likedBy?: number;
}

export class CategoryDto {
  @ApiProperty({ description: 'Unique identifier for an image category' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'Name of the image category' })
  @IsNotEmpty()
  @IsString()
  category: string;
}


export class ImageDto {
  @ApiProperty({ description: 'Unique image identifier' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'URL of the image' })
  @IsString()
  @IsNotEmpty()
  picture: string;

  @ApiProperty({ description: 'Category ID this image belongs to' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}


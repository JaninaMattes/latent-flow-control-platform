import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

export class ImageFrameDto {
  @ApiProperty({ description: 'Unique identifier for an image category' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'Specifies the frame in an interpolation sequence.' })
  @IsNotEmpty()
  @IsNumber()
  frameIndex: number;

  // S3 bucket: cloud front information
  @ApiProperty({ description: 'URL of the image.' })
  @IsNotEmpty()
  @IsString()
  picture: string;

  @ApiProperty({ description: 'IDs of the two parent images.' })
  @IsNotEmpty()
  parentImageIds: string[];
}

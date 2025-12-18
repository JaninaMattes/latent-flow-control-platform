import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, } from 'class-validator';

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


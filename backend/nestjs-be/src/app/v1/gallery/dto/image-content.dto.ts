import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsNumber } from "class-validator";

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

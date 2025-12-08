import { ApiProperty } from "@nestjs/swagger";
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class GoogleAuthDto {

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Expose()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Expose()
  accessToken: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Expose()
  refreshToken?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Expose({ name: 'expires_in' })
  expiresIn: number;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsNumberString,
  Min,
  Max,
} from 'class-validator';

export class QueryProductsDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiPropertyOptional({ default: 5, minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  limit = 5;

  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumberString() minPrice?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumberString() maxPrice?: string;
  @ApiPropertyOptional({ enum: ['name', 'price', 'createdAt'] })
  @IsOptional()
  @IsString()
  sort?: 'name' | 'price' | 'createdAt';
}

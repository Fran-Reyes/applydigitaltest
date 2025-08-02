import { IsInt, IsOptional, IsString, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductsDto {
  @Type(() => Number) @IsInt() @IsOptional() page?: number = 1;
  @Type(() => Number) @IsInt() @IsOptional() limit?: number = 5;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsNumberString() minPrice?: string;
  @IsOptional() @IsNumberString() maxPrice?: string;
  @IsOptional() @IsString() sort?: 'name' | 'price' | 'createdAt';
}

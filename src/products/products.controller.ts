import {
  Controller,
  Get,
  Query,
  Delete,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { Product } from './product.entity';
import { Paginated } from '../common/types/paginated';
import { ProductResponseDto } from './dto/product.response';

@ApiTags('Public: Products')
@ApiExtraModels(ProductResponseDto)
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page >= 1',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (<= 5)',
    example: 5,
  })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['name', 'price', 'createdAt'],
  })
  @Get()
  @ApiOkResponse({
    description: 'Paged products',
    schema: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
        total: { type: 'number' },
        items: {
          type: 'array',
          items: { $ref: getSchemaPath(ProductResponseDto) },
        },
      },
    },
  })
  list(@Query() q: QueryProductsDto): Promise<Paginated<Product>> {
    return this.service.findAll(q);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.softDelete(id);
  }
}

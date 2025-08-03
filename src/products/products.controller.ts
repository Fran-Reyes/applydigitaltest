import {
  Controller,
  Get,
  Query,
  Delete,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { ApiOkResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { Product } from './product.entity';

@ApiTags('Public: Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

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
          items: { $ref: getSchemaPath(Product) },
        },
      },
    },
  })
  list(@Query() q: QueryProductsDto) {
    return this.service.findAll(q);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.softDelete(id);
  }
}

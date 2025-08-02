import {
  Controller,
  Get,
  Query,
  UsePipes,
  Delete,
  Param,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { MaxLimitPipe } from '../common/pipes/max-limit.pipe';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Public: Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  @UsePipes(new MaxLimitPipe())
  list(@Query() q: QueryProductsDto) {
    return this.service.findAll(q);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.softDelete(id);
  }
}

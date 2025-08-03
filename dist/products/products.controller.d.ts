import { ProductsService } from './products.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { Product } from './product.entity';
import { Paginated } from '../common/types/paginated';
export declare class ProductsController {
    private readonly service;
    constructor(service: ProductsService);
    list(q: QueryProductsDto): Promise<Paginated<Product>>;
    remove(id: string): Promise<{
        affected: number;
    }>;
}

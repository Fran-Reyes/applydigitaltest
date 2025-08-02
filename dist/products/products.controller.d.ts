import { ProductsService } from './products.service';
import { QueryProductsDto } from './dto/query-products.dto';
export declare class ProductsController {
    private readonly service;
    constructor(service: ProductsService);
    list(q: QueryProductsDto): Promise<{
        page: number;
        limit: number;
        total: number;
        items: import("./product.entity").Product[];
    }>;
    remove(id: string): Promise<{
        affected: number;
    }>;
}

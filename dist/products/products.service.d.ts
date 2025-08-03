import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { QueryProductsDto } from './dto/query-products.dto';
import { Paginated } from 'src/common/types/paginated';
export declare class ProductsService {
    private readonly repo;
    constructor(repo: Repository<Product>);
    findAll(q: QueryProductsDto): Promise<Paginated<Product>>;
    softDelete(id: string): Promise<{
        affected: number;
    }>;
    upsertFromContentful(payload: {
        contentfulId: string;
        name: string;
        category?: string | null;
        price?: number | null;
        currency?: string | null;
    }): Promise<Product>;
}

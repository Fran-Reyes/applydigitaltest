import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { QueryProductsDto } from './dto/query-products.dto';
export declare class ProductsService {
    private readonly repo;
    constructor(repo: Repository<Product>);
    findAll(q: QueryProductsDto): Promise<{
        page: number;
        limit: number;
        total: number;
        items: Product[];
    }>;
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

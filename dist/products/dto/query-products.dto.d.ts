export declare class QueryProductsDto {
    page?: number;
    limit?: number;
    name?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: 'name' | 'price' | 'createdAt';
}

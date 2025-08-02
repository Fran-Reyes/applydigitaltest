import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
export declare class ReportsService {
    private readonly repo;
    constructor(repo: Repository<Product>);
    deletedPercentage(): Promise<{
        total: number;
        deleted: number;
        percentage: number;
    }>;
    nonDeletedPercentage(params: {
        hasPrice?: boolean;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        total: number;
        matched: number;
        percentage: number;
    }>;
    topCategories(limit?: number): Promise<{
        totalNonDeleted: number;
        items: {
            category: string;
            count: number;
            percentage: number;
        }[];
    }>;
}

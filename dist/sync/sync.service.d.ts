import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';
export declare class SyncService {
    private readonly cfg;
    private readonly products;
    private readonly logger;
    constructor(cfg: ConfigService, products: ProductsService);
    private http;
    private pickLocalized;
    private mapEntry;
    private buildUrl;
    private delay;
    private fetchPage;
    refreshOnce(): Promise<{
        total: number;
        imported: number;
    }>;
    hourly(): Promise<void>;
}

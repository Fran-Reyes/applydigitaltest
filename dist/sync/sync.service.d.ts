import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';
export declare class SyncService {
    private readonly cfg;
    private readonly products;
    private readonly logger;
    constructor(cfg: ConfigService, products: ProductsService);
    private contentfulUrl;
    private pickLocalized;
    private mapEntry;
    refreshOnce(): Promise<{
        imported: number;
    }>;
    hourly(): Promise<void>;
}

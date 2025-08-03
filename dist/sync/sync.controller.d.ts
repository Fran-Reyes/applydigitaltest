import { SyncService } from './sync.service';
export declare class SyncController {
    private readonly service;
    constructor(service: SyncService);
    refresh(): Promise<{
        total: number;
        imported: number;
    }>;
}

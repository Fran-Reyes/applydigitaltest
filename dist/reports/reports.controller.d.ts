import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly service;
    constructor(service: ReportsService);
    deleted(): Promise<{
        total: number;
        deleted: number;
        percentage: number;
    }>;
    nonDeleted(q: {
        hasPrice?: 'true' | 'false';
        startDate?: string;
        endDate?: string;
    }): Promise<{
        total: number;
        matched: number;
        percentage: number;
    }>;
    top(limit?: string): Promise<{
        totalNonDeleted: number;
        items: {
            category: string;
            count: number;
            percentage: number;
        }[];
    }>;
}

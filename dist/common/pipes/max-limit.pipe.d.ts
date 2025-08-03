import { PipeTransform } from '@nestjs/common';
export declare class MaxLimitPipe implements PipeTransform {
    transform(value: {
        limit?: number;
    }): {
        limit: number;
    };
}

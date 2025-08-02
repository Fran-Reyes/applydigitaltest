import { PipeTransform, BadRequestException } from '@nestjs/common';
export class MaxLimitPipe implements PipeTransform {
  transform(value: { limit?: number }) {
    const limit = Number(value.limit ?? 5);
    if (limit > 5) throw new BadRequestException('limit cannot exceed 5');
    return { ...value, limit };
  }
}

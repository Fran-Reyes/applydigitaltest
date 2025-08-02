import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Not, Repository } from 'typeorm';
import { Product } from '../products/product.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
  ) {}

  async deletedPercentage() {
    const total = await this.repo.count();
    const deleted = await this.repo.count({ where: { isDeleted: true } });
    const percentage = total ? (deleted * 100) / total : 0;
    return { total, deleted, percentage: Number(percentage.toFixed(2)) };
  }

  async nonDeletedPercentage(params: {
    hasPrice?: boolean;
    startDate?: string;
    endDate?: string;
  }) {
    const total = await this.repo.count();
    const where: Partial<Record<string, any>> = { isDeleted: false };

    if (params?.hasPrice === true) where.price = Not(IsNull());
    if (params?.hasPrice === false) where.price = IsNull();

    if (params?.startDate && params?.endDate) {
      where.createdAt = Between(
        new Date(params.startDate),
        new Date(params.endDate),
      );
    }

    const matched = await this.repo.count({ where });
    const percentage = total ? (matched * 100) / total : 0;
    return { total, matched, percentage: Number(percentage.toFixed(2)) };
  }

  async topCategories(limit = 5) {
    type TopCategoryRow = { category: string; count: string | number };

    const rows: TopCategoryRow[] = await this.repo
      .createQueryBuilder('p')
      .select("COALESCE(p.category, 'uncategorized')", 'category')
      .addSelect('COUNT(*)', 'count')
      .where('p.isDeleted = false')
      .groupBy('category')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    const totalNonDeleted = await this.repo.count({
      where: { isDeleted: false },
    });
    const items = rows.map((r) => ({
      category: r.category,
      count: Number(r.count),
      percentage: totalNonDeleted
        ? Number(((Number(r.count) * 100) / totalNonDeleted).toFixed(2))
        : 0,
    }));
    return { totalNonDeleted, items };
  }
}

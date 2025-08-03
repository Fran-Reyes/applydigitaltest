import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  ILike,
  Between,
  FindOptionsWhere,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { Product } from './product.entity';
import { QueryProductsDto } from './dto/query-products.dto';
import { Paginated } from 'src/common/types/paginated';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
  ) {}

  async findAll(q: QueryProductsDto): Promise<Paginated<Product>> {
    const { page = 1, limit = 5, name, category, minPrice, maxPrice, sort } = q;
    const where: FindOptionsWhere<Product> = { isDeleted: false };
    if (name) where.name = ILike(`%${name}%`);
    if (category) where.category = ILike(category);
    if (minPrice && maxPrice)
      where.price = Between(Number(minPrice), Number(maxPrice));
    else if (minPrice) where.price = MoreThanOrEqual(Number(minPrice));
    else if (maxPrice) where.price = LessThanOrEqual(Number(maxPrice));

    const order: Partial<Record<keyof Product, 'ASC' | 'DESC'>> = {};
    if (
      sort &&
      [
        'name',
        'category',
        'price',
        'currency',
        'contentfulId',
        'isDeleted',
      ].includes(sort)
    ) {
      order[sort as keyof Product] = 'ASC';
    }

    const [items, total] = await this.repo.findAndCount({
      where,
      order,
      take: limit,
      skip: (page - 1) * limit,
    });
    return { page, limit, total, items };
  }

  async softDelete(id: string) {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) return { affected: 0 };
    if (product.isDeleted) return { affected: 0 };
    product.isDeleted = true;
    await this.repo.save(product);
    return { affected: 1 };
  }

  async upsertFromContentful(payload: {
    contentfulId: string;
    name: string;
    category?: string | null;
    price?: number | null;
    currency?: string | null;
  }) {
    const existing = await this.repo.findOne({
      where: { contentfulId: payload.contentfulId },
    });
    if (existing) {
      const updated = this.repo.merge(existing, {
        name: payload.name,
        category: payload.category ?? null,
        price: payload.price ?? null,
        currency: payload.currency ?? null,
      });
      return this.repo.save(updated);
    } else {
      const created = this.repo.create({
        contentfulId: payload.contentfulId,
        name: payload.name,
        category: payload.category ?? null,
        price: payload.price ?? null,
        currency: payload.currency ?? null,
        isDeleted: false,
      });
      return this.repo.save(created);
    }
  }
}

import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportsService } from './reports.service';
import { Product } from '../products/product.entity';

type MockRepo = Partial<Record<keyof Repository<Product>, jest.Mock>>;

function qbMock(rows: any[]) {
  type QueryBuilderMock = {
    select: () => QueryBuilderMock;
    addSelect: () => QueryBuilderMock;
    where: () => QueryBuilderMock;
    groupBy: () => QueryBuilderMock;
    orderBy: () => QueryBuilderMock;
    limit: () => QueryBuilderMock;
    getRawMany: () => Promise<any[]>;
  };
  const qb: QueryBuilderMock = {
    select: () => qb,
    addSelect: () => qb,
    where: () => qb,
    groupBy: () => qb,
    orderBy: () => qb,
    limit: () => qb,
    getRawMany: jest.fn().mockResolvedValue(rows),
  };
  return qb;
}

describe('ReportsService', () => {
  let service: ReportsService;
  let repo: MockRepo;

  beforeEach(async () => {
    repo = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    const mod = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Product), useValue: repo },
      ],
    }).compile();
    service = mod.get(ReportsService);
  });

  it('deletedPercentage', async () => {
    (repo.count as jest.Mock)
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(5);
    const r = await service.deletedPercentage();
    expect(r).toEqual({ total: 100, deleted: 5, percentage: 5 });
  });

  it('nonDeletedPercentage con hasPrice=true', async () => {
    (repo.count as jest.Mock)
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(80);
    const r = await service.nonDeletedPercentage({ hasPrice: true });
    expect(r.percentage).toBe(80);
  });

  it('topCategories calcula porcentajes', async () => {
    (repo.createQueryBuilder as jest.Mock).mockReturnValue(
      qbMock([
        { category: 'Camera', count: '20' },
        { category: 'Phone', count: '10' },
      ]),
    );
    (repo.count as jest.Mock).mockResolvedValue(60);
    const r = await service.topCategories(2);
    expect(r.items[0]).toEqual({
      category: 'Camera',
      count: 20,
      percentage: 33.33,
    });
  });
});

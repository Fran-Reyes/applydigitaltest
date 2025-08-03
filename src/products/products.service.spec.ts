import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './product.entity';

type MockRepo = Partial<Record<keyof Repository<Product>, jest.Mock>>;

const repoMock = (): MockRepo => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  merge: jest.fn((entity: Partial<Product>, dto: Partial<Product>) => ({
    ...entity,
    ...dto,
  })),
});

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: MockRepo;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: repoMock() },
      ],
    }).compile();
    service = mod.get(ProductsService);
    repo = mod.get(getRepositoryToken(Product));
  });

  it('findAll aplica paginación, límite y filtro por name', async () => {
    (repo.findAndCount as jest.Mock).mockResolvedValue([[], 0]);
    await service.findAll({ page: 2, limit: 5, name: 'cam' });
    expect(repo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: ILike('%cam%'),
          isDeleted: false,
        }),
        take: 5,
        skip: 5,
      }),
    );
  });

  it('softDelete marca isDeleted=true y no “resucita” borrados', async () => {
    const p = { id: '1', isDeleted: false } as Product;
    (repo.findOne as jest.Mock).mockResolvedValue(p);
    (repo.save as jest.Mock).mockResolvedValue({ ...p, isDeleted: true });
    const res = await service.softDelete('1');
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ isDeleted: true }),
    );
    expect(res).toEqual({ affected: 1 });

    (repo.findOne as jest.Mock).mockResolvedValue({ id: '1', isDeleted: true });
    const res2 = await service.softDelete('1');
    expect(res2).toEqual({ affected: 0 });
  });

  it('upsertFromContentful actualiza y preserva isDeleted', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue({
      id: '1',
      contentfulId: 'c1',
      isDeleted: true,
      name: 'old',
    });
    (repo.save as jest.Mock).mockImplementation((x: Product): Product => x);
    const r = await service.upsertFromContentful({
      contentfulId: 'c1',
      name: 'new',
    });
    expect(r.isDeleted).toBe(true);
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'new' }),
    );
  });
});

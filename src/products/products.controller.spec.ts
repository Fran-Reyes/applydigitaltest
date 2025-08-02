import { Test } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { QueryProductsDto } from './dto/query-products.dto';

describe('ProductsController', () => {
  let ctrl: ProductsController;
  const service = {
    findAll: jest
      .fn()
      .mockResolvedValue({ page: 1, limit: 5, total: 0, items: [] }),
    softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: service }],
    }).compile();
    ctrl = mod.get(ProductsController);
  });

  it('GET /products delega en service', async () => {
    const res = await ctrl.list({ page: 1, limit: 5 } as QueryProductsDto);
    expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 5 });
    expect(res).toEqual({ page: 1, limit: 5, total: 0, items: [] });
  });

  it('DELETE /products/:id retorna affected', async () => {
    const res = await ctrl.remove('abc');
    expect(service.softDelete).toHaveBeenCalledWith('abc');
    expect(res).toEqual({ affected: 1 });
  });
});

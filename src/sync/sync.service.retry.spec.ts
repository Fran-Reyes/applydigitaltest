import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';
import { SyncService } from './sync.service';

describe('SyncService retry', () => {
  let svc: SyncService;
  let getMock: jest.Mock;
  const products = { upsertFromContentful: jest.fn() };

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        SyncService,
        { provide: ConfigService, useValue: { get: () => 'x' } },
        { provide: ProductsService, useValue: products },
      ],
    }).compile();
    svc = mod.get(SyncService);

    getMock = jest
      .fn()
      .mockRejectedValueOnce({ response: { status: 429 }, message: 'rate' })
      .mockResolvedValueOnce({
        data: { total: 0, skip: 0, limit: 1, items: [] },
      });
    jest
      .spyOn(SyncService.prototype as any, 'http')
      .mockReturnValue({ get: getMock });
  });

  it('reintenta una vez en 429', async () => {
    const r = await svc.refreshOnce();
    expect(getMock).toHaveBeenCalledTimes(2);
    expect(r).toEqual({ total: 0, imported: 0 });
  });
});

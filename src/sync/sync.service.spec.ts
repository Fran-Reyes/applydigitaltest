import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';
import { SyncService } from './sync.service';

describe('SyncService', () => {
  let svc: SyncService;
  let products: { upsertFromContentful: jest.Mock };
  let getMock: jest.Mock;

  beforeEach(async () => {
    products = { upsertFromContentful: jest.fn() };

    const mod = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: ConfigService,
          useValue: {
            get: (k: string) => {
              if (k === 'CONTENTFUL_SPACE_ID') return 's';
              if (k === 'CONTENTFUL_ENVIRONMENT') return 'master';
              if (k === 'CONTENTFUL_ACCESS_TOKEN') return 't';
              if (k === 'CONTENTFUL_CONTENT_TYPE') return 'product';
              if (k === 'CONTENTFUL_USE_PREVIEW') return 'false';
              return undefined;
            },
          },
        },
        { provide: ProductsService, useValue: products },
      ],
    }).compile();

    svc = mod.get(SyncService);

    getMock = jest.fn();
    jest
      .spyOn(SyncService.prototype as any, 'http')
      .mockReturnValue({ get: getMock });
  });

  it('refreshOnce mapea y hace upsert', async () => {
    getMock.mockResolvedValue({
      data: {
        total: 1,
        skip: 0,
        limit: 1,
        items: [
          {
            sys: { id: 'c1' },
            fields: { name: { 'en-US': 'Cam' }, price: 10 },
          },
        ],
      },
    });

    const r = await svc.refreshOnce();

    expect(products.upsertFromContentful).toHaveBeenCalledWith(
      expect.objectContaining({ contentfulId: 'c1', name: 'Cam', price: 10 }),
    );
    expect(r).toEqual({ total: 1, imported: 1 });
  });
});

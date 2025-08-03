import { Test } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { JwtGuard } from '../auth/jwt.guard';

describe('ReportsController', () => {
  let ctrl: ReportsController;
  const svc = {
    deletedPercentage: jest
      .fn()
      .mockResolvedValue({ total: 10, deleted: 2, percentage: 20 }),
    nonDeletedPercentage: jest
      .fn()
      .mockResolvedValue({ total: 10, matched: 8, percentage: 80 }),
    topCategories: jest
      .fn()
      .mockResolvedValue({ totalNonDeleted: 8, items: [] }),
  };

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: svc }],
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    ctrl = mod.get(ReportsController);
  });

  it('deleted-percentage', async () => {
    await expect(ctrl.deleted()).resolves.toEqual({
      total: 10,
      deleted: 2,
      percentage: 20,
    });
  });

  it('non-deleted-percentage con hasPrice=true', async () => {
    await ctrl.nonDeleted({ hasPrice: 'true' });
    expect(svc.nonDeletedPercentage).toHaveBeenCalledWith({
      hasPrice: true,
      startDate: undefined,
      endDate: undefined,
    });
  });

  it('top-categories default 5', async () => {
    await ctrl.top();
    expect(svc.topCategories).toHaveBeenCalledWith(5);
  });
});

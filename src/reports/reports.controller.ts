import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtGuard } from '../auth/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Private: Reports')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('deleted-percentage')
  deleted() {
    return this.service.deletedPercentage();
  }

  @Get('non-deleted-percentage')
  nonDeleted(
    @Query()
    q: {
      hasPrice?: 'true' | 'false';
      startDate?: string;
      endDate?: string;
    },
  ) {
    const hasPrice =
      q.hasPrice === undefined ? undefined : q.hasPrice === 'true';
    return this.service.nonDeletedPercentage({
      hasPrice,
      startDate: q.startDate,
      endDate: q.endDate,
    });
  }

  @Get('top-categories')
  top(@Query('limit') limit?: string) {
    return this.service.topCategories(limit ? Number(limit) : 5);
  }
}

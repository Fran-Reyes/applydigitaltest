import { Controller, Post } from '@nestjs/common';
import { SyncService } from './sync.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sync')
@Controller('sync')
export class SyncController {
  constructor(private readonly service: SyncService) {}
  @Post('refresh')
  refresh() {
    return this.service.refreshOnce();
  }
}

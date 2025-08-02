import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';

@Module({
  imports: [ProductsModule],
  providers: [SyncService],
  controllers: [SyncController],
  exports: [SyncService],
})
export class SyncModule {}

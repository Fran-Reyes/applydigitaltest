import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from './products/product.entity';
import { ProductsModule } from './products/products.module';
import { SyncModule } from './sync/sync.module';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get<string>('DB_HOST'),
        port: parseInt(cfg.get<string>('DB_PORT') ?? '5432', 10),
        username: cfg.get<string>('DB_USER'),
        password: cfg.get<string>('DB_PASS'),
        database: cfg.get<string>('DB_NAME'),
        entities: [Product],
        synchronize: true,
      }),
    }),
    ProductsModule,
    SyncModule,
    AuthModule,
    ReportsModule,
  ],
})
export class AppModule {}

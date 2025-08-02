"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const product_entity_1 = require("./products/product.entity");
const products_module_1 = require("./products/products.module");
const sync_module_1 = require("./sync/sync.module");
const auth_module_1 = require("./auth/auth.module");
const reports_module_1 = require("./reports/reports.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    type: 'postgres',
                    host: cfg.get('DB_HOST'),
                    port: parseInt(cfg.get('DB_PORT') ?? '5432', 10),
                    username: cfg.get('DB_USER'),
                    password: cfg.get('DB_PASS'),
                    database: cfg.get('DB_NAME'),
                    entities: [product_entity_1.Product],
                    synchronize: true,
                }),
            }),
            products_module_1.ProductsModule,
            sync_module_1.SyncModule,
            auth_module_1.AuthModule,
            reports_module_1.ReportsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
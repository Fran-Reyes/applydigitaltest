"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@nestjs/config");
const products_service_1 = require("../products/products.service");
let SyncService = SyncService_1 = class SyncService {
    cfg;
    products;
    logger = new common_1.Logger(SyncService_1.name);
    constructor(cfg, products) {
        this.cfg = cfg;
        this.products = products;
    }
    contentfulUrl() {
        const space = this.cfg.get('CONTENTFUL_SPACE_ID');
        const env = this.cfg.get('CONTENTFUL_ENVIRONMENT');
        const token = this.cfg.get('CONTENTFUL_ACCESS_TOKEN');
        const type = this.cfg.get('CONTENTFUL_CONTENT_TYPE') || 'product';
        return `https://cdn.contentful.com/spaces/${space}/environments/${env}/entries?access_token=${token}&content_type=${type}`;
    }
    pickLocalized(value, kind, locale = 'en-US') {
        let v;
        if (value &&
            typeof value === 'object' &&
            value !== null &&
            Object.hasOwn(value, locale)) {
            v = value[locale];
        }
        else {
            v = value;
        }
        if (kind === 'number') {
            let n;
            if (typeof v === 'number') {
                n = v;
            }
            else if (typeof v === 'string') {
                n = Number(v);
            }
            else {
                n = NaN;
            }
            return Number.isFinite(n) ? n : null;
        }
        return typeof v === 'string' ? v : null;
    }
    mapEntry(e) {
        const f = e.fields ?? {};
        const name = this.pickLocalized(f['name'], 'string') ?? 'Unnamed';
        const category = this.pickLocalized(f['category'], 'string');
        const price = this.pickLocalized(f['price'], 'number');
        const currency = this.pickLocalized(f['currency'], 'string');
        return { contentfulId: e.sys?.id, name, category, price, currency };
    }
    async refreshOnce() {
        const url = this.contentfulUrl();
        const response = await axios_1.default.get(url);
        const data = response.data;
        const entries = Array.isArray(data.items) ? data.items : [];
        for (const entry of entries) {
            const mapped = this.mapEntry(entry);
            if (typeof mapped.contentfulId === 'string' && mapped.name) {
                await this.products.upsertFromContentful({
                    ...mapped,
                    contentfulId: mapped.contentfulId,
                });
            }
        }
        return { imported: entries.length };
    }
    async hourly() {
        this.logger.log('Running hourly Contentful sync...');
        try {
            await this.refreshOnce();
            this.logger.log('Sync ok');
        }
        catch (e) {
            this.logger.error('Sync failed', typeof e === 'object' && e !== null && 'stack' in e
                ? e.stack
                : String(e));
        }
    }
};
exports.SyncService = SyncService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncService.prototype, "hourly", null);
exports.SyncService = SyncService = SyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        products_service_1.ProductsService])
], SyncService);
//# sourceMappingURL=sync.service.js.map
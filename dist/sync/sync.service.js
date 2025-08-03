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
const MAX_RETRIES = 5;
const JITTER_MS = 250;
let SyncService = SyncService_1 = class SyncService {
    cfg;
    products;
    logger = new common_1.Logger(SyncService_1.name);
    constructor(cfg, products) {
        this.cfg = cfg;
        this.products = products;
    }
    http() {
        const token = this.cfg.get('CONTENTFUL_ACCESS_TOKEN');
        return axios_1.default.create({
            baseURL: this.cfg.get('CONTENTFUL_USE_PREVIEW') === 'true'
                ? 'https://preview.contentful.com'
                : 'https://cdn.contentful.com',
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
        });
    }
    pickLocalized(value, kind, locale = 'en-US') {
        const v = value && typeof value === 'object' && value !== null
            ? (value[locale] ?? value)
            : value;
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
    buildUrl(skip, limit) {
        const s = this.cfg.get('CONTENTFUL_SPACE_ID');
        const e = this.cfg.get('CONTENTFUL_ENVIRONMENT');
        const c = this.cfg.get('CONTENTFUL_CONTENT_TYPE') ?? 'product';
        const page = limit ?? Number(this.cfg.get('CONTENTFUL_PAGE_SIZE') ?? 100);
        const select = 'fields.name,fields.category,fields.price,fields.currency,sys.id';
        return `/spaces/${s}/environments/${e}/entries?content_type=${c}&skip=${skip}&limit=${page}&select=${encodeURIComponent(select)}`;
    }
    async delay(ms) {
        await new Promise((r) => setTimeout(r, ms));
    }
    async fetchPage(client, skip, attempt = 0) {
        const url = this.buildUrl(skip);
        try {
            const { data } = await client.get(url);
            return data;
        }
        catch (err) {
            const e = err;
            const status = e.response?.status;
            const headers = (e.response?.headers ?? {});
            const msg = typeof e.response?.data === 'object' &&
                e.response?.data !== null &&
                'message' in e.response.data
                ? e.response.data.message
                : (e.message ?? 'Contentful request failed');
            if (status === 429 && attempt < MAX_RETRIES) {
                const retryAfter = Number(headers['retry-after']);
                const reset = Number(headers['x-contentful-ratelimit-reset']);
                let baseMs;
                if (Number.isFinite(retryAfter)) {
                    baseMs = retryAfter * 1000;
                }
                else if (Number.isFinite(reset)) {
                    baseMs = reset * 1000;
                }
                else {
                    baseMs = 500 * 2 ** attempt;
                }
                const wait = Math.round(baseMs + Math.random() * JITTER_MS);
                this.logger.warn(`429 rate limit (attempt ${attempt + 1}/${MAX_RETRIES}), waiting ${wait}ms…`);
                await this.delay(wait);
                return this.fetchPage(client, skip, attempt + 1);
            }
            this.logger.error(`Contentful ${status ?? ''}: ${msg}`);
            throw e;
        }
    }
    async refreshOnce() {
        const client = this.http();
        let skip = 0;
        let total = 0;
        let imported = 0;
        const defaultPage = Number(this.cfg.get('CONTENTFUL_PAGE_SIZE') ?? 100);
        do {
            const page = await this.fetchPage(client, skip);
            total = page.total;
            for (const entry of page.items ?? []) {
                const m = this.mapEntry(entry);
                if (typeof m.contentfulId === 'string' && m.name) {
                    await this.products.upsertFromContentful({
                        ...m,
                        contentfulId: m.contentfulId,
                    });
                    imported++;
                }
            }
            skip += page.limit ?? page.items?.length ?? defaultPage;
        } while (skip < total);
        return { total, imported };
    }
    async hourly() {
        this.logger.log('Running hourly Contentful sync...');
        try {
            const res = await this.refreshOnce();
            this.logger.log(`Sync ok: imported=${res.imported}/${res.total}`);
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            this.logger.error(`Sync failed: ${msg}`);
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
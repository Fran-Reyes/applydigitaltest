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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../products/product.entity");
let ReportsService = class ReportsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async deletedPercentage() {
        const total = await this.repo.count();
        const deleted = await this.repo.count({ where: { isDeleted: true } });
        const percentage = total ? (deleted * 100) / total : 0;
        return { total, deleted, percentage: Number(percentage.toFixed(2)) };
    }
    async nonDeletedPercentage(params) {
        const total = await this.repo.count();
        const where = { isDeleted: false };
        if (params?.hasPrice === true)
            where.price = (0, typeorm_2.Not)((0, typeorm_2.IsNull)());
        if (params?.hasPrice === false)
            where.price = (0, typeorm_2.IsNull)();
        if (params?.startDate && params?.endDate) {
            where.createdAt = (0, typeorm_2.Between)(new Date(params.startDate), new Date(params.endDate));
        }
        const matched = await this.repo.count({ where });
        const percentage = total ? (matched * 100) / total : 0;
        return { total, matched, percentage: Number(percentage.toFixed(2)) };
    }
    async topCategories(limit = 5) {
        const rows = await this.repo
            .createQueryBuilder('p')
            .select("COALESCE(p.category, 'uncategorized')", 'category')
            .addSelect('COUNT(*)', 'count')
            .where('p.isDeleted = false')
            .groupBy('category')
            .orderBy('count', 'DESC')
            .limit(limit)
            .getRawMany();
        const totalNonDeleted = await this.repo.count({
            where: { isDeleted: false },
        });
        const items = rows.map((r) => ({
            category: r.category,
            count: Number(r.count),
            percentage: totalNonDeleted
                ? Number(((Number(r.count) * 100) / totalNonDeleted).toFixed(2))
                : 0,
        }));
        return { totalNonDeleted, items };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map
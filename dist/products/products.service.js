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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./product.entity");
let ProductsService = class ProductsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async findAll(q) {
        const { page = 1, limit = 5, name, category, minPrice, maxPrice, sort } = q;
        const where = { isDeleted: false };
        if (name)
            where.name = (0, typeorm_2.ILike)(`%${name}%`);
        if (category)
            where.category = (0, typeorm_2.ILike)(category);
        if (minPrice && maxPrice)
            where.price = (0, typeorm_2.Between)(Number(minPrice), Number(maxPrice));
        else if (minPrice)
            where.price = (0, typeorm_2.MoreThanOrEqual)(Number(minPrice));
        else if (maxPrice)
            where.price = (0, typeorm_2.LessThanOrEqual)(Number(maxPrice));
        const order = {};
        if (sort &&
            [
                'name',
                'category',
                'price',
                'currency',
                'contentfulId',
                'isDeleted',
            ].includes(sort)) {
            order[sort] = 'ASC';
        }
        const [items, total] = await this.repo.findAndCount({
            where,
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { page, limit, total, items };
    }
    async softDelete(id) {
        const product = await this.repo.findOne({ where: { id } });
        if (!product)
            return { affected: 0 };
        if (product.isDeleted)
            return { affected: 0 };
        product.isDeleted = true;
        await this.repo.save(product);
        return { affected: 1 };
    }
    async upsertFromContentful(payload) {
        const existing = await this.repo.findOne({
            where: { contentfulId: payload.contentfulId },
        });
        if (existing) {
            const updated = this.repo.merge(existing, {
                name: payload.name,
                category: payload.category ?? null,
                price: payload.price ?? null,
                currency: payload.currency ?? null,
            });
            return this.repo.save(updated);
        }
        else {
            const created = this.repo.create({
                contentfulId: payload.contentfulId,
                name: payload.name,
                category: payload.category ?? null,
                price: payload.price ?? null,
                currency: payload.currency ?? null,
                isDeleted: false,
            });
            return this.repo.save(created);
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map
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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const jwt_guard_1 = require("../auth/jwt.guard");
const swagger_1 = require("@nestjs/swagger");
let ReportsController = class ReportsController {
    service;
    constructor(service) {
        this.service = service;
    }
    deleted() {
        return this.service.deletedPercentage();
    }
    nonDeleted(q) {
        const hasPrice = q.hasPrice === undefined ? undefined : q.hasPrice === 'true';
        return this.service.nonDeletedPercentage({
            hasPrice,
            startDate: q.startDate,
            endDate: q.endDate,
        });
    }
    top(limit) {
        return this.service.topCategories(limit ? Number(limit) : 5);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('deleted-percentage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "deleted", null);
__decorate([
    (0, common_1.Get)('non-deleted-percentage'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "nonDeleted", null);
__decorate([
    (0, common_1.Get)('top-categories'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "top", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Private: Reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map
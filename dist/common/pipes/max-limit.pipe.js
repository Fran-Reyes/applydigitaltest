"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxLimitPipe = void 0;
const common_1 = require("@nestjs/common");
class MaxLimitPipe {
    transform(value) {
        const limit = Number(value.limit ?? 5);
        if (limit > 5)
            throw new common_1.BadRequestException('limit cannot exceed 5');
        return { ...value, limit };
    }
}
exports.MaxLimitPipe = MaxLimitPipe;
//# sourceMappingURL=max-limit.pipe.js.map
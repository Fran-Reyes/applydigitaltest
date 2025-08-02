"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const validationOpts = {
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    };
    app.useGlobalPipes(new common_1.ValidationPipe(validationOpts));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Products API')
        .setDescription('Public & Private modules')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
void bootstrap();
//# sourceMappingURL=main.js.map
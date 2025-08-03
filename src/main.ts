import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const validationOpts: ValidationPipeOptions = {
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  };
  app.useGlobalPipes(new ValidationPipe(validationOpts));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Products API')
    .setDescription('Public & Private modules')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}

void bootstrap();

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app/app.module';
import { LoggingInterceptor } from './bootstrap/logging.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  // ---- Global middleware ----
  app.use(cookieParser());
  app.use(helmet());

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') ?? '*',
    credentials: true,
  });

  // ---- Global pipes & interceptors ----
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  // ---- Global prefix ----
  app.setGlobalPrefix('v1');

  // ---- Swagger ----
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Latent Flow Control')
    .setDescription('The Flow Control Platform description')
    .setVersion('1.0')
    .addTag('flow')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // ---- Listen (LAST step) ----
  await app.listen(port);
  console.log(`App is running on http://localhost:${port}`);
}

bootstrap();

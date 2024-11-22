import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import rTracer from 'cls-rtracer';
import helmet from 'helmet';
import compression from 'compression';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { CustomLoggerService } from './common/logger/custom-logger.service';
import { HttpStatus, Logger, RequestMethod } from '@nestjs/common';
import { optionsMiddleware } from './common/middlewares/options.middleware';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT);

  app.useLogger(app.get(CustomLoggerService));
  Logger.log(`Running on http://localhost:${process.env.PORT}`);
}
bootstrap();

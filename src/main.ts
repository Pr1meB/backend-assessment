import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from './config/env';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableShutdownHooks();

  const configOptions = new DocumentBuilder()
    .setTitle('PebbleScore API')
    .setDescription('The PebbleScore activity ingestion API')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, configOptions);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(config.PORT);
}
bootstrap();

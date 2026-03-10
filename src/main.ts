import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from 'prisma/filters/prisma-exeptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  //PRISMA FILTER
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaExceptionFilter(httpAdapter));

  //SWAGGER
  const config = new DocumentBuilder()
    .setTitle('ArtNode API')
    .setDescription(
      'The core API for ArtNode artifacts and experience tracking.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseInterceptor(),
  ); //(ClassSerializerInterceptor)Prevents backend from sending data that i didnt explicitly tell it to send to the frontend, therefore theres a smaller chance of leaking passwordHash (which i dont need i guess because of supabase) from the database
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

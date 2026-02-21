import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://192.168.6.202:3000',
      'http://192.168.6.2:3002',
    ],
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();

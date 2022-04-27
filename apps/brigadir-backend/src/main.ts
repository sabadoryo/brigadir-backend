import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const whitelist = [
  'https://brigadir.sabadoryo.com',
  'http://localhost:3006',
  undefined,
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.enableCors({
    origin: (origin, callback) => {
      if (whitelist.includes(origin)) {
        callback(null, true);
      } else {
        console.log('error');
        callback(new Error('not allowed by origin'));
      }
    },
  });
  await app.listen(3000);
}
bootstrap();

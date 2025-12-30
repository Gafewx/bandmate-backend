import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // หรือใส่โดเมน Frontend ภายหลัง
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 👇 แก้บรรทัดนี้สำคัญมาก!
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

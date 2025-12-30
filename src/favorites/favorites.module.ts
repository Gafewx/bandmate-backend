import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './favorite.entity';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite])], // 👈 เชื่อมต่อกับ Database Table
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService], // เผื่อโมดูลอื่นอยากเรียกใช้
})
export class FavoritesModule {}
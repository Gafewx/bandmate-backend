import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 👈 1. เพิ่ม import นี้
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity'; // 👈 2. เพิ่ม import นี้

@Module({
  imports: [TypeOrmModule.forFeature([Review])], 
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
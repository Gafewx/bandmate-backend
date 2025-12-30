import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async create(data: any) {
    const review = this.reviewsRepository.create(data);
    return this.reviewsRepository.save(review);
  }

  // ดึงรีวิวของห้อง พร้อมชื่อคนเม้น
  async findByRoom(roomId: number) {
    return this.reviewsRepository.find({
      where: { room_id: roomId },
      relations: ['user'], // Join เอาชื่อคนเม้นมาด้วย
      order: { created_at: 'DESC' }
    });
  }
}
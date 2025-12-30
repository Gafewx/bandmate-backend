import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() body: any) {
    return this.reviewsService.create(body);
  }

  @Get('room/:id')
  findByRoom(@Param('id') id: string) {
    return this.reviewsService.findByRoom(+id);
  }
}
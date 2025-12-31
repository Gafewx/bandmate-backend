import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SchedulesService } from './schedules.service';

@Controller('api/bands/:bandId/schedule')
export class SchedulesController {
  constructor(private readonly service: SchedulesService) {}

  @Get()
  getBandSchedule(@Param('bandId') bandId: string) {
    return this.service.getBandSchedule(+bandId);
  }

  @Post()
  saveSchedule(
    @Param('bandId') bandId: string,
    @Body() body: { userId: number; slots: string[] }, // รับ userId และ slots ["0-10", "1-12"]
  ) {
    return this.service.saveMySchedule(+bandId, body.userId, body.slots);
  }
}
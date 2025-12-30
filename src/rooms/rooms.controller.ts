import { Controller, Get, Post, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common'; // เพิ่ม Post, Delete
import { RoomsService } from './rooms.service';
import type { Response } from 'express';

@Controller('api/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(+id);
  }

  // 👇 API สร้างห้องใหม่ (POST)
  @Post()
  async create(@Body() body: any, @Res() res: Response) {
    try {
      const room = await this.roomsService.create(body);
      return res.status(HttpStatus.OK).json({ message: 'Room created', room });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error creating room' });
    }
  }

  // 👇 API ลบห้อง (DELETE)
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.roomsService.remove(+id);
      return res.status(HttpStatus.OK).json({ message: 'Room deleted' });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error deleting room' });
    }
  }
}
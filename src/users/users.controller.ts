// 👇 1. เพิ่ม Query ในวงเล็บปีกกา
import { Controller, Get, Post, Body, Res, HttpStatus, Patch, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import type { Response } from 'express';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. Register
  @Post('register')
  async register(@Body() body: any, @Res() res: Response) {
    try {
      await this.usersService.create(body);
      return res.status(HttpStatus.OK).json({ message: 'Register successful' });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error registering user' });
    }
  }

  // 2. Login
  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    const user = await this.usersService.findByUsername(body.username);
    if (user && user.password === body.password) {
      return res.status(HttpStatus.OK).json({ message: 'Login successful', user });
    }
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
  }

  // 3. Get Musicians (พร้อมรับค่า Search)
  @Get('musicians')
  async getMusicians(@Query('search') search: string) { // 👈 ใช้ @Query ตรงนี้
    return this.usersService.findAll(search);
  }

  @Get('match/:id')
  async getMatch(@Param('id') id: string) {
    return this.usersService.findMatch(+id);
  }

  // 4. Get By ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id); 
  }

  // 5. Update
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(+id, body);
  }
}
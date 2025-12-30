import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('api/favorites')
export class FavoritesController {
  constructor(private readonly favService: FavoritesService) {}

  @Post('toggle')
  async toggle(@Body() body: any) {
    return this.favService.toggle(body.user_id, body.target_id, body.type);
  }

  @Get('user/:id')
  async getUserFavorites(@Param('id') id: string) {
    return this.favService.getUserFavorites(+id);
  }
}
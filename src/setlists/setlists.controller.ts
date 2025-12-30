import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { SetlistsService } from './setlists.service';

@Controller('api/setlists')
export class SetlistsController {
  constructor(private readonly setlistsService: SetlistsService) {}

  @Get()
  getSetlists(@Query('bandId') bandId: string) {
    return this.setlistsService.findAllByBand(+bandId);
  }

  @Post()
  createSetlist(@Body() body: { bandId: number; title: string; targetDate?: string }) {
    return this.setlistsService.createSetlist(body.bandId, body.title, body.targetDate);
  }

  @Post(':id/songs')
  addSong(@Param('id') id: string, @Body() body: any) {
    return this.setlistsService.addSong(+id, body);
  }

  @Patch('songs/:songId')
  updateSongStatus(@Param('songId') songId: string, @Body('status') status: string) {
    return this.setlistsService.updateSongStatus(+songId, status);
  }

  @Delete('songs/:songId')
  deleteSong(@Param('songId') songId: string) {
    return this.setlistsService.deleteSong(+songId);
  }
}
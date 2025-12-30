import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setlist } from './entities/setlist.entity';
import { Song } from './entities/song.entity';
import { SetlistsService } from './setlists.service';
import { SetlistsController } from './setlists.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Setlist, Song])],
  controllers: [SetlistsController],
  providers: [SetlistsService],
})
export class SetlistsModule {}
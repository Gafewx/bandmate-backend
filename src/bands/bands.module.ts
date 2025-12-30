import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BandsController } from './bands.controller';
import { BandsService } from './bands.service';
import { Band } from './band.entity';
import { BandMember } from './band-member.entity';
import { BandMessage } from './band-message.entity';

@Module({
  imports: [
    // จดจำ Entity ที่เกี่ยวข้องเพื่อให้ Service เรียกใช้ Repository ได้
    TypeOrmModule.forFeature([Band, BandMember, BandMessage])
  ],
  controllers: [BandsController],
  providers: [BandsService],
  exports: [BandsService] // export ไว้เผื่อ module อื่นต้องใช้
})
export class BandsModule {}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Band } from './band.entity';
import { BandMember } from './band-member.entity';
import { BandMessage } from './band-message.entity';

@Injectable()
export class BandsService {
    constructor(
        @InjectRepository(Band) private bandRepo: Repository<Band>,
        @InjectRepository(BandMember) private memberRepo: Repository<BandMember>,
        @InjectRepository(BandMessage) private msgRepo: Repository<BandMessage>,
    ) { }

    // สร้างวงใหม่
    async createBand(data: { name: string; description: string; ownerId: number }) {
        // 1. สร้างวง
        const newBand = this.bandRepo.create({
            band_name: data.name,
            description: data.description,
            band_img: `https://ui-avatars.com/api/?name=${data.name}&background=random&size=256` // รูป Default
        });
        const savedBand = await this.bandRepo.save(newBand);

        // 2. จับคนสร้างยัดเข้าเป็นสมาชิกคนแรก (Leader)
        const newMember = this.memberRepo.create({
            band_id: savedBand.band_id,
            user_id: data.ownerId,
            role: 'leader',
            status: 'active'
        });
        await this.memberRepo.save(newMember);

        return savedBand;
    }

    // ดึงวงทั้งหมดที่ user คนนี้อยู่
    async getUserBands(userId: number) {
        return this.memberRepo.find({
            where: { user_id: userId, status: 'active' },
            relations: ['band', 'band.members', 'band.members.user'], // Join เพื่อเอาชื่อวงและชื่อเพื่อนในวง
        });
    }

    // ใน BandsService
    async getBandDetail(bandId: number) {
        return this.bandRepo.findOne({
            where: { band_id: bandId },
            relations: ['members', 'members.user'], // Join เอาข้อมูลสมาชิกและ User Profile มาด้วย
        });
    }

    async addMember(bandId: number, userId: number) {
        const existing = await this.memberRepo.findOne({
            where: { band_id: bandId, user_id: userId }
        });

        if (existing) {
            if (existing.status === 'pending') throw new Error('Already invited');
            if (existing.status === 'active') throw new Error('User already in band');
        }

        const newMember = this.memberRepo.create({
            band_id: bandId,
            user_id: userId,
            role: 'member',
            status: 'pending' // 👈 เปลี่ยนจาก active เป็น pending
        });

        return this.memberRepo.save(newMember);
    }

    // 2. เพิ่มฟังก์ชัน: ดึงคำเชิญที่รออยู่ของ User คนนี้
    async getPendingInvitations(userId: number) {
        return this.memberRepo.find({
            where: { user_id: userId, status: 'pending' },
            relations: ['band'], // ดึงข้อมูลวงมาโชว์ด้วย
        });
    }

    // 3. เพิ่มฟังก์ชัน: ตอบรับหรือปฏิเสธ
    async respondToInvitation(memberId: number, userId: number, action: 'accept' | 'reject') {
        const member = await this.memberRepo.findOne({ where: { id: memberId, user_id: userId } });
        if (!member) throw new Error('Invitation not found');

        if (action === 'accept') {
            member.status = 'active';
            return this.memberRepo.save(member);
        } else {
            // ถ้าปฏิเสธ ให้ลบทิ้งไปเลย (จะได้เชิญใหม่ได้ถ้าเปลี่ยนใจ)
            return this.memberRepo.remove(member);
        }
    }

    async removeMember(bandId: number, targetUserId: number, requesterId: number) {
        // 1. หาข้อมูลสมาชิกที่จะโดนลบ
        const targetMember = await this.memberRepo.findOne({
            where: { band_id: bandId, user_id: targetUserId }
        });
        if (!targetMember) throw new Error('Member not found');

        // 2. หาข้อมูลคนสั่งลบ (เพื่อเช็คว่าเป็น Leader ไหม)
        const requester = await this.memberRepo.findOne({
            where: { band_id: bandId, user_id: requesterId }
        });

        if (!requester) throw new Error('You are not in this band');

        // 3. กฎการลบ:
        // - ถ้าลบตัวเอง (Leave) -> ทำได้เลย
        // - ถ้าคนสั่งเป็น Leader -> ลบคนอื่นได้
        if (requesterId !== targetUserId && requester.role !== 'leader') {
            throw new Error('Only leader can kick members');
        }

        // ห้ามลบ Leader (Leader ต้องโอนตำแหน่งก่อน หรือยุบวง)
        if (targetMember.role === 'leader') {
            throw new Error('Cannot kick the leader');
        }

        return this.memberRepo.remove(targetMember);
    }

    async sendBandMessage(bandId: number, userId: number, content: string) {
        const msg = this.msgRepo.create({
            band_id: bandId,
            user_id: userId,
            content: content
        });
        const saved = await this.msgRepo.save(msg);

        // Return ข้อมูลพร้อม User Profile (เพื่อเอาไปโชว์รูปโปรไฟล์คนส่ง)
        return this.msgRepo.findOne({
            where: { id: saved.id },
            relations: ['sender']
        });
    }

    async findBandByUserId(userId: number) {
        // ค้นหาในตาราง BandMember ว่า user_id นี้สังกัดวงไหน
        const member = await this.memberRepo.findOne({
            where: { user: { user_id: userId } },
            relations: ['band']
        });
        return member ? member.band : null;
    }

    // 👇 2. ดึงประวัติข้อความในวง
    async getBandMessages(bandId: number) {
        return this.msgRepo.find({
            where: { band_id: bandId },
            relations: ['sender'],
            order: { created_at: 'ASC' } // เรียงจากเก่าไปใหม่
        });
    }
}
import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { BandsService } from './bands.service';

@Controller('api/bands')
export class BandsController {
    constructor(private readonly bandsService: BandsService) { }

    @Post()
    create(@Body() body: any) {
        return this.bandsService.createBand(body);
    }

    @Get('user/:userId')
    getUserBands(@Param('userId') userId: string) {
        return this.bandsService.getUserBands(+userId);
    }

    @Get(':id')
    getBandDetail(@Param('id') id: string) {
        return this.bandsService.getBandDetail(+id);
    }

    @Post(':id/add-member')
    async addMember(@Param('id') id: string, @Body() body: { userId: number }) {
        return this.bandsService.addMember(+id, body.userId);
    }

    @Get('invitations/user/:userId')
    getInvitations(@Param('userId') userId: string) {
        return this.bandsService.getPendingInvitations(+userId);
    }

    @Post('invitations/:memberId/respond')
    respond(
        @Param('memberId') memberId: string,
        @Body() body: { userId: number, action: 'accept' | 'reject' }
    ) {
        return this.bandsService.respondToInvitation(+memberId, body.userId, body.action);
    }

    @Delete(':id/members/:userId')
    removeMember(
        @Param('id') bandId: string,
        @Param('userId') targetUserId: string,
        @Body('requesterId') requesterId: number // ส่ง ID คนกดลบมาเช็คสิทธิ์
    ) {
        return this.bandsService.removeMember(+bandId, +targetUserId, requesterId);
    }

    @Get(':id/messages')
    getMessages(@Param('id') id: string) {
        return this.bandsService.getBandMessages(+id);
    }

    // 👇 ส่งข้อความ (ใช้สำหรับ HTTP Fallback หรือยิงผ่าน API)
    @Post(':id/messages')
    sendMessage(@Param('id') id: string, @Body() body: { userId: number, content: string }) {
        return this.bandsService.sendBandMessage(+id, body.userId, body.content);
    }
}
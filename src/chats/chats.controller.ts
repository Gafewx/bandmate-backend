// src/chats/chats.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChatsService } from './chats.service';

@Controller('api/chats') 
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('start')
  async startChat(@Body() body: { myId: number; targetId: number }) {
    return this.chatsService.startChat(body.myId, body.targetId);
  }

  @Get('my/:userId') 
  async getMyConversations(@Param('userId') userId: string) {
    return this.chatsService.getMyConversations(+userId);
  }

  @Get('messages/:conversationId')
  async getMessages(@Param('conversationId') id: string) {
    return this.chatsService.getMessages(+id);
  }

  @Post('send')
  async sendMessage(@Body() body: { conversationId: number; senderId: number; text: string }) {
    return this.chatsService.sendMessage(body.conversationId, body.senderId, body.text);
  }
}
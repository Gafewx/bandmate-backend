import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket, 
  WebSocketServer 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BandsService } from '../bands/bands.service'; // 👈 เรียกใช้ BandsService

@WebSocketGateway({ cors: true }) // เปิด CORS ให้ Frontend เชื่อมต่อได้
export class ChatsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly bandsService: BandsService, // Inject Service ของวง
  ) {}

  // 🟢 เมื่อ User เข้าหน้าแชทวง -> ให้ Join ห้อง
  @SubscribeMessage('join_band')
  handleJoinBand(
    @MessageBody() data: { bandId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `band_${data.bandId}`;
    client.join(roomName);
    console.log(`Client ${client.id} joined ${roomName}`);
  }

  // 🔴 เมื่อ User ออกจากหน้าแชท
  @SubscribeMessage('leave_band')
  handleLeaveBand(
    @MessageBody() data: { bandId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `band_${data.bandId}`;
    client.leave(roomName);
  }

  // 📨 เมื่อ User ส่งข้อความในวง
  @SubscribeMessage('send_band_message')
  async handleBandMessage(
    @MessageBody() data: { bandId: number; userId: number; content: string },
  ) {
    // 1. บันทึกลง Database (เรียกใช้ Logic เดิมใน BandsService)
    const savedMsg = await this.bandsService.sendBandMessage(
      data.bandId, 
      data.userId, 
      data.content
    );

    // 2. ส่งข้อความบอก "ทุกคนในห้อง" (Real-time)
    this.server.to(`band_${data.bandId}`).emit('new_band_message', savedMsg);
  }
}
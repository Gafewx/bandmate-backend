import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Repository, EntityManager } from 'typeorm'; // ใช้ EntityManager รัน SQL ดิบ

@Injectable()
export class ChatsService {
    constructor(private manager: EntityManager,
        private notificationsService: NotificationsService,
    ) { }

    async startChat(myUserId: number, targetUserId: number) {
        // 1. เช็คว่าเคยมีห้องคุยกันหรือยัง (สลับตำแหน่งได้ user1, user2)
        const existingChat = await this.manager.query(
            `SELECT conversation_id FROM conversations 
       WHERE (user1_id = ? AND user2_id = ?) 
       OR (user1_id = ? AND user2_id = ?) LIMIT 1`,
            [myUserId, targetUserId, targetUserId, myUserId]
        );

        if (existingChat.length > 0) {
            // ถ้ามีแล้ว ส่ง ID กลับไปเลย
            return { conversation_id: existingChat[0].conversation_id, isNew: false };
        }

        // 2. ถ้ายังไม่มี -> สร้างห้องใหม่
        const result = await this.manager.query(
            `INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)`,
            [myUserId, targetUserId]
        );

        return { conversation_id: result.insertId, isNew: true };
    }

    // ... (imports)

    async getMyConversations(myUserId: number) {
        try {
            const sql = `
            SELECT 
                c.conversation_id,
                CASE 
                    WHEN c.user1_id = ? THEN c.user2_id 
                    ELSE c.user1_id 
                END as partner_id,
                u.full_name as partner_name,
                u.profile_img as partner_img,
                (SELECT message_text FROM messages m 
                 WHERE m.conversation_id = c.conversation_id 
                 ORDER BY created_at DESC LIMIT 1) as last_message
            FROM conversations c
            JOIN users u ON u.user_id = (CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END)
            WHERE c.user1_id = ? OR c.user2_id = ?
            ORDER BY c.updated_at DESC
        `;

            // ส่ง parameter เข้าไป 4 ตัวตามเครื่องหมาย ? ใน SQL
            return await this.manager.query(sql, [myUserId, myUserId, myUserId, myUserId]);
        } catch (error) {
            console.error('SQL Error in getMyConversations:', error);
            throw error;
        }
    }

    async getMessages(conversationId: number) {
        return this.manager.query(
            `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`,
            [conversationId]
        );
    }

    async sendMessage(conversationId: number, senderId: number, text: string) {
        // 1. บันทึกข้อความลงตาราง messages
        await this.manager.query(
            `INSERT INTO messages (conversation_id, sender_id, message_text) VALUES (?, ?, ?)`,
            [conversationId, senderId, text]
        );

        // 2. อัปเดตเวลาล่าสุดของห้องสนทนา
        await this.manager.query(
            `UPDATE conversations SET updated_at = NOW() WHERE conversation_id = ?`,
            [conversationId]
        );

        // 3. 🔥 ส่งการแจ้งเตือนไปยังผู้รับ
        try {
            // หาว่าใครคือผู้รับ (คนที่ไม่ใช่ senderId ในห้องนี้)
            const chatRoom = await this.manager.query(
                `SELECT user1_id, user2_id FROM conversations WHERE conversation_id = ?`,
                [conversationId]
            );

            if (chatRoom.length > 0) {
                const receiverId = chatRoom[0].user1_id === senderId
                    ? chatRoom[0].user2_id
                    : chatRoom[0].user1_id;

                // หาชื่อคนส่ง เพื่อเอาไปโชว์ในแจ้งเตือน
                const sender = await this.manager.query(
                    `SELECT full_name FROM users WHERE user_id = ?`,
                    [senderId]
                );

                const senderName = sender[0]?.full_name || 'เพื่อนนักดนตรี';

                // 🔔 สร้าง Notification จริงๆ
                await this.notificationsService.create(
                    receiverId,
                    `💬 ${senderName}: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`,
                    'info'
                );
            }
        } catch (error) {
            console.error('Notification Error:', error);
            // ถึงแจ้งเตือนพัง แต่ข้อความต้องส่งออกไปได้ (เลยไม่ throw error)
        }

        return { success: true };
    }
}
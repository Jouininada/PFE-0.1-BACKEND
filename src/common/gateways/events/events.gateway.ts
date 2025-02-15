import {
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket as IoSocket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WSRoom } from '../../../app/enums/ws-room.enum';
import { Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';

@WebSocketGateway({
  path: '/ws',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
})
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server: Server;

  private rooms: Map<string, Set<string>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket server initialized');
  }

  async handleConnection(client: IoSocket) {
    const token = client.handshake?.headers?.authorization?.split(' ')[1];
    if (!token) {
      client.disconnect(true);
      return;
    }
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get('app.jwtSecret', { infer: true }),
      });

      if (!decoded || !decoded.email) {
        client.disconnect(true);
        return;
      }

      const uniqueId = randomBytes(4).toString('hex');
      client.data.user = { ...decoded, email: `${decoded.email}#${uniqueId}` };

      console.log(`Client connected: ${client.data.user.email}`);
    } catch (error) {
      client.disconnect(true);
      console.error('Token verification failed:', error);
      return;
    }
  }

  @SubscribeMessage('joinRoom')
  joinRoom(
    @ConnectedSocket() client: IoSocket,
    @MessageBody() roomName: WSRoom,
  ): void {
    if (!client.data.user) {
      client.disconnect(true);
      return;
    }
    client.join(roomName);
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }
    this.rooms.get(roomName)!.add(client.data.user.email);
    console.log(`${client.data.user.email} joined room ${roomName}`);
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(
    @ConnectedSocket() client: IoSocket,
    @MessageBody() roomName: WSRoom,
  ): void {
    if (!client.data.user) {
      client.disconnect(true);
      return;
    }

    client.leave(roomName);

    // Remove user from the room, but keep the room alive
    if (this.rooms.has(roomName)) {
      this.rooms.get(roomName)!.delete(client.data.user.email);
    }

    console.log(`${client.data.user.email} left room ${roomName}`);
  }

  sendToRoom(roomName: WSRoom, message: string, data: any): void {
    if (this.rooms.has(roomName)) {
      this.server.to(roomName).emit(message, data);
      console.log(`Message sent to room ${roomName}: ${message}`);
    } else {
      console.log(`Room ${roomName} does not exist.`);
    }
  }

  getRoomMembers(roomName: WSRoom): string[] {
    return this.rooms.has(roomName)
      ? Array.from(this.rooms.get(roomName)!)
      : [];
  }

  handleDisconnect(client: IoSocket): any {
    if (!client.data.user || !client.data.user.email) {
      console.log('Client disconnected, no user found');
      return;
    }

    this.rooms.forEach((members) => {
      members.delete(client.data.user.email);
    });

    console.log(`${client.data.user.email} disconnected`);
  }
}

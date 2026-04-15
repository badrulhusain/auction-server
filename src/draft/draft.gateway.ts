import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DraftService } from './draft.service';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: 'draft',
})
export class DraftGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    constructor(private readonly draftService: DraftService) {}

    handleConnection(client: Socket) {
        console.log(`Draft WS connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Draft WS disconnected: ${client.id}`);
    }

    /**
     * Client joins a session room to receive real-time draft state updates.
     * Emits the current state immediately on join.
     */
    @SubscribeMessage('join_session')
    async handleJoinSession(
        @MessageBody() data: { sessionId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const room = `session:${data.sessionId}`;
        await client.join(room);
        console.log(`Client ${client.id} joined room ${room}`);

        try {
            const state = await this.draftService.getState(data.sessionId);
            client.emit('draft_state', state);
        } catch (err) {
            client.emit('error', { message: 'Failed to fetch draft state' });
        }
    }

    /**
     * Broadcasts the latest draft state to all clients in a session room.
     * Called internally after a pick is made or the draft is started.
     */
    async broadcastState(sessionId: string) {
        try {
            const state = await this.draftService.getState(sessionId);
            this.server.to(`session:${sessionId}`).emit('draft_state', state);
        } catch (err) {
            console.error(`Failed to broadcast state for session ${sessionId}:`, err);
        }
    }

    /**
     * Broadcasts the latest summary (pick history) to all clients in a session room.
     */
    async broadcastSummary(sessionId: string) {
        try {
            const summary = await this.draftService.getSummary(sessionId);
            this.server.to(`session:${sessionId}`).emit('draft_summary', summary);
        } catch (err) {
            console.error(`Failed to broadcast summary for session ${sessionId}:`, err);
        }
    }
}

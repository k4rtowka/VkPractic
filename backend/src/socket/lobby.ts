import type { Server } from 'socket.io';
import type { LobbyParticipant } from '../types/lobby';

let io: Server | null = null;

export function setLobbyIo(server: Server): void {
  io = server;
}

export function emitLobbyParticipants(
  sessionId: number,
  participants: LobbyParticipant[],
): void {
  if (!io) return;
  io.to(`session:${sessionId}`).emit('lobby:participants', {
    participants,
    count: participants.length,
  });
}

export function emitLobbyUserJoined(sessionId: number, userName: string): void {
  if (!io) return;
  io.to(`session:${sessionId}`).emit('lobby:user_joined', { userName });
}

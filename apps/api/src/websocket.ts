import http from 'http';
import { join } from 'path';
import socket from 'ws';

interface ChatRoom {
  roomId: string;
  clients: socket[]; // 방에 참여한 WebSocket 클라이언트 목록
  users: string[]; // 방에 참여한 사용자 목록
}

interface MessageType {
  action: actionType;
  roomId: string;
  userId: string;
  content: string;
}

type actionType = 'create' | 'join' | 'leave' | 'message';
const chatRooms: ChatRoom[] = [];

const setWebSocket = (server: http.Server) => {
  const ws = new socket.Server({ server });

  ws.on('connection', socket => {
    // 포트 번호 확인
    socket.on('message', (message: string) => {
      const parsedMessage: MessageType = JSON.parse(message);
      const { action, roomId, userId, content } = parsedMessage;

      switch (action) {
        case 'create': {
          const roomExists = chatRooms.some(room => room.roomId === roomId);
          if (roomExists) {
            socket.send(JSON.stringify({ action: 'error', message: 'Room already exists' }));
            break;
          }
          chatRooms.push({ roomId, clients: [socket], users: [userId] });
          socket.send(JSON.stringify({ action: 'create', roomId, userId }));
          break;
        }
        case 'join': {
          const joinRoom = chatRooms.find(room => room.roomId === roomId);
          if (joinRoom) {
            joinRoom.clients.push(socket);
            joinRoom.users.push(userId);
            socket.send(JSON.stringify({ action: 'join', roomId }));
            joinRoom.clients.forEach(client => {
              client.send(JSON.stringify({ action: 'join', userId }));
            });
          } else {
            socket.send(JSON.stringify({ action: 'error', message: 'Room not found' }));
          }
          break;
        }
        case 'message': {
          const messageRoom = chatRooms.find(room => room.roomId === roomId);
          if (messageRoom) {
            messageRoom.clients.forEach(client => {
              if (client !== socket) client.send(JSON.stringify({ action: 'message', userId, content }));
            });
          } else {
            socket.send(JSON.stringify({ action: 'error', message: 'Room not found' }));
          }
          break;
        }
        case 'leave': {
          const leaveRoom = chatRooms.find(room => room.roomId === roomId);
          if (leaveRoom) {
            leaveRoom.clients = leaveRoom.clients.filter(client => client !== socket);
            leaveRoom.users = leaveRoom.users.filter(user => user !== userId);
            socket.send(JSON.stringify({ action: 'leave', roomId }));
            leaveRoom.clients.forEach(client => {
              client.send(JSON.stringify({ action: 'leave', userId }));
            });
          } else {
            socket.send(JSON.stringify({ action: 'error', message: 'Room not found' }));
          }
          break;
        }
      }
    });

    socket.on('close', () => {
      chatRooms.forEach(room => {
        room.clients = room.clients.filter(client => client !== socket);
      });
    });
  });

  return ws;
};

export default setWebSocket;

import http from 'http';
import socket from 'ws';

interface ChatRoom {
  roomId: string;
  clients: socket[]; // 방에 참여한 WebSocket 클라이언트 목록
  users: string[]; // 방에 참여한 사용자 목록
}

interface MessageType {
  action: actionType;
  roomId: string;
  nickname: string;
  content: string;
}

type actionType = 'create' | 'join' | 'message' | 'leave' | 'delete';
let chatRooms: ChatRoom[] = [];

const messageHandler = (message: string, socket: socket) => {
  const parsedMessage: MessageType = JSON.parse(message);
  const { action, roomId, nickname, content } = parsedMessage;

  switch (action) {
    case 'create': {
      const roomExists = chatRooms.some(room => room.roomId === roomId);
      if (roomExists) {
        socket.send(JSON.stringify({ action: 'error', message: 'Room already exists' }));
        break;
      }
      chatRooms.push({ roomId, clients: [socket], users: [nickname] });
      socket.send(JSON.stringify({ action: 'create', chatRooms }));
      break;
    }
    case 'join': {
      const joinRoom = chatRooms.find(room => room.roomId === roomId);
      if (joinRoom) {
        const userExists = joinRoom.users.some(user => user === nickname);
        if (userExists) {
          socket.send(JSON.stringify({ action: 'error', message: 'User already exists' }));
          break;
        }
        joinRoom.clients.push(socket);
        joinRoom.users.push(nickname);
        socket.send(JSON.stringify({ action: 'join', chatRooms }));
        joinRoom.clients.forEach(client => {
          client.send(JSON.stringify({ action: 'join', chatRooms }));
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
          //   if (client !== socket)
          client.send(JSON.stringify({ action: 'message', nickname, content }));
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
        leaveRoom.users = leaveRoom.users.filter(user => user !== nickname);
        if (leaveRoom.clients.length === 0) {
          chatRooms = chatRooms.filter(room => room.roomId !== roomId);
        }
        socket.send(JSON.stringify({ action: 'leave', chatRooms }));
        leaveRoom.clients.forEach(client => {
          client.send(JSON.stringify({ action: 'leave', chatRooms }));
        });
      } else {
        socket.send(JSON.stringify({ action: 'error', message: 'Room not found' }));
      }
      break;
    }

    case 'delete': {
      const deleteRoom = chatRooms.find(room => room.roomId === roomId);
      if (deleteRoom) {
        const tempRooms = chatRooms.filter(room => room.roomId !== roomId);
        deleteRoom.clients.forEach(client => {
          client.send(JSON.stringify({ action: 'delete', chatRooms: tempRooms }));
        });
        chatRooms = tempRooms;
      } else {
        socket.send(JSON.stringify({ action: 'error', message: 'Room not found' }));
      }
      break;
    }
  }
};

const setWebSocket = (server: http.Server) => {
  const ws = new socket.Server({ server });

  ws.on('connection', socket => {
    socket.send(JSON.stringify({ action: 'connect', chatRooms }));

    socket.on('message', (message: string) => messageHandler(message, socket));

    socket.on('close', () => {
      chatRooms.forEach(room => {
        room.clients = room.clients.filter(client => client !== socket);
      });
    });
  });

  return ws;
};

export default setWebSocket;

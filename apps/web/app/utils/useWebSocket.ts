import { useEffect, useRef, useState } from 'react';

interface MessageType {
  action: actionType;
  roomId: string;
  nickname?: string;
  content?: string;
}

interface ChatRoomType {
  roomId: string;
  users: string[]; // 방에 참여한 사용자 목록
}

type actionType = 'create' | 'join' | 'message' | 'leave' | 'delete';

const useWebSocket = () => {
  const [input, setInput] = useState<string>(''); // 수신 메시지 저장
  const [chatRooms, setChatRooms] = useState<ChatRoomType[]>([]); // 현재 방
  const [isConnected, setIsConnected] = useState(false); // 연결 상태
  const socketRef = useRef<WebSocket | null>(null);

  const url = 'ws://localhost:8080';

  useEffect(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    // 연결이 열렸을 때
    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    // 메시지를 수신했을 때
    socket.onmessage = event => {
      const data = JSON.parse(event.data);
      console.log('Received:', data);
      const action = data.action;

      switch (action) {
        case 'connect': {
          break;
        }
        case 'create': {
          const serverRoom = data.chatRooms;
          setChatRooms([...serverRoom]);
          console.log(`Room created with ID: ${data.roomId}`);
          break;
        }

        case 'join': {
          const serverRoom = data.chatRooms;
          setChatRooms([...serverRoom]);
          console.log(`Joined room with ID: ${data.roomId}`);
          break;
        }

        case 'message': {
          console.log(`Message from ${data.nickname}: ${data.content}`);
          break;
        }
        case 'leave': {
          const serverRoom = data.chatRooms;
          setChatRooms([...serverRoom]);
          console.log('Left the room');
          break;
        }
        case 'delete': {
          const serverRoom = data.chatRooms;
          setChatRooms([...serverRoom]);
          console.log('delete room');
          break;
        }
        case 'error': {
          console.log(`Error: ${data.message}`);
          break;
        }
      }
    };

    // 연결이 닫혔을 때
    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    // 에러 처리
    socket.onerror = error => {
      console.error('WebSocket error:', error);
    };

    // 컴포넌트가 언마운트되거나 url이 변경될 때 소켓 닫기
    return () => {
      socket.close();
    };
  }, [url]);

  const createRoom = (roomId: string, nickname: string) => {
    const socket = socketRef.current;

    if (!socket) return;
    const message: MessageType = {
      action: 'create',
      roomId,
      nickname,
    };
    socket.send(JSON.stringify(message));
  };

  // 채팅방 참가
  const joinRoom = (roomId: string, nickname: string) => {
    const socket = socketRef.current;
    if (!socket) return;
    const message: MessageType = {
      action: 'join',
      roomId,
      nickname,
    };
    socket.send(JSON.stringify(message));
  };

  // 채팅방 나가기
  const leaveRoom = (roomId: string, nickname: string) => {
    const socket = socketRef.current;
    if (!socket) return;

    const message: MessageType = {
      action: 'leave',
      roomId,
      nickname,
    };
    socket.send(JSON.stringify(message));
  };

  const deleteRoom = (roomId: string) => {
    const socket = socketRef.current;
    if (!socket) return;

    const message: MessageType = {
      action: 'delete',
      roomId,
    };
    socket.send(JSON.stringify(message));
  };

  // 메시지 전송
  const sendMessage = (roomId: string, nickname: string) => {
    const socket = socketRef.current;
    if (!socket) return;

    const message: MessageType = {
      action: 'message',
      roomId,
      nickname,
      content: input,
    };
    socket.send(JSON.stringify(message));
  };

  return { input, setInput, chatRooms, isConnected, createRoom, joinRoom, leaveRoom, deleteRoom, sendMessage };
};

export default useWebSocket;

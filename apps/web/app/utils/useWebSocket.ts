import { useEffect, useRef, useState } from 'react';

interface MessageType {
  action: actionType;
  roomId: string;
  userId?: string;
  content?: string;
}

interface ChatRoomType {
  roomId: string;
  users: string[]; // 방에 참여한 사용자 목록
}

type actionType = 'create' | 'join' | 'leave' | 'message';

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
        case 'create': {
          console.log(`Room created with ID: ${data.roomId}`);
          setChatRooms(prev => [...prev, { roomId: data.roomId, users: [data.userId] }]);
          break;
        }

        case 'join': {
          console.log(`Joined room with ID: ${data.roomId}`);
          break;
        }
        case 'leave': {
          console.log('Left the room');
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

  const createRoom = (roomId: string, userId: string) => {
    const socket = socketRef.current;

    if (!socket) return;
    const message: MessageType = {
      action: 'create',
      roomId,
      userId,
    };
    socket.send(JSON.stringify(message));
  };

  // 채팅방 참가
  const joinRoom = (roomId: string, userId: string) => {
    const socket = socketRef.current;
    if (!socket) return;
    const message: MessageType = {
      action: 'join',
      roomId: roomId,
      userId: userId,
    };
    socket.send(JSON.stringify(message));
  };

  // 메시지 전송
  const sendMessage = (roomId: string, userId: string) => {
    const socket = socketRef.current;
    if (!socket) return;

    const message: MessageType = {
      action: 'message',
      roomId,
      userId,
      content: input,
    };
    socket.send(JSON.stringify(message));
  };

  return { input, setInput, chatRooms, isConnected, createRoom, joinRoom, sendMessage };
};

export default useWebSocket;

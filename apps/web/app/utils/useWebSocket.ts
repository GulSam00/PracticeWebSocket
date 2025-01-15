import { useEffect, useRef, useState } from 'react';

const useWebSocket = (url: string) => {
  const [messages, setMessages] = useState<string[]>([]); // 수신 메시지 저장
  const [isConnected, setIsConnected] = useState(false); // 연결 상태
  const socketRef = useRef<WebSocket | null>(null);

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
      setMessages(prev => [...prev, event.data]);
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

  const sendMessage = (message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.error('WebSocket is not connected.');
    }
  };

  return { messages, isConnected, sendMessage };
};

export default useWebSocket;

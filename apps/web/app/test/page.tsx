'use client';

import { useWebSocket } from 'utils';

const Home = () => {
  const { input, setInput, isConnected, createRoom, joinRoom, sendMessage } = useWebSocket();

  const handleChange = (e: any) => {
    const value = e.target.value;
    setInput(value);
  };

  const handleCreateRoom = () => {
    createRoom('room1', 'user1');
  };

  const handleJoinRoom = () => {
    joinRoom('room1', 'user2');
  };
  const handleSendMessage = () => {
    sendMessage('room1', 'user1');
  };

  return (
    <div>
      <h1>WebSocket Example</h1>
      <p>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={handleCreateRoom}>방 만들기</button>
      <button onClick={handleJoinRoom}>방 참가하기</button>

      <button onClick={handleSendMessage} disabled={!isConnected}>
        Send Message
      </button>
      <div>
        <input type='text' value={input} placeholder='메세지' onChange={handleChange} />
      </div>
    </div>
  );
};

export default Home;

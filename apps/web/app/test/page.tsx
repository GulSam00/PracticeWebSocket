'use client';

import { useWebSocket } from 'utils';

const Home = () => {
  const { messages, isConnected, sendMessage } = useWebSocket('ws://localhost:3001');

  const handleSendMessage = () => {
    sendMessage('Hello from Next.js!');
  };

  return (
    <div>
      <h1>WebSocket Example</h1>
      <p>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={handleSendMessage} disabled={!isConnected}>
        Send Message
      </button>
      <div>
        <h2>Messages:</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;

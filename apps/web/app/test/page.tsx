'use client';

import { useState } from 'react';
import { useWebSocket } from 'utils';

const Home = () => {
  const { input, setInput, chatRooms, isConnected, createRoom, joinRoom, leaveRoom, deleteRoom, sendMessage } =
    useWebSocket();
  const [nickname, setNickname] = useState('');

  const handleChangeInput = (e: any) => {
    const value = e.target.value;
    setInput(value);
  };

  const handleChangeNickname = (e: any) => {
    const value = e.target.value;
    setNickname(value);
  };

  const handleCreateRoom = () => {
    if (!nickname) {
      alert('닉네임을 입력해주세요');
      return;
    }
    const randId = Math.random().toString().substr(2, 8);
    createRoom('room' + randId, nickname);
  };

  const handleJoinRoom = (roomId: string) => {
    joinRoom(roomId, nickname);
  };

  const handleLeaveRoom = (roomId: string) => {
    leaveRoom(roomId, nickname);
  };

  const handleDeleteRoom = (roomId: string) => {
    deleteRoom(roomId);
  };

  const handleSendMessage = () => {
    chatRooms.forEach(chatRoom => {
      if (chatRoom.users.includes(nickname)) {
        sendMessage(chatRoom.roomId, nickname);
      }
    });
  };

  return (
    <div>
      <h1>WebSocket Example</h1>
      <p>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <input type='text' value={nickname} placeholder='닉네임' onChange={handleChangeNickname} />

      <button onClick={handleCreateRoom}>방 만들기</button>

      <button onClick={handleSendMessage} disabled={!isConnected}>
        Send Message
      </button>
      <div>
        <input type='text' value={input} placeholder='메세지' onChange={handleChangeInput} />
      </div>

      <div>
        {chatRooms.length > 0 &&
          chatRooms.map((chatRoom, index) => {
            return (
              <div key={chatRoom.roomId + index}>
                <h2>roomID : {chatRoom.roomId}</h2>
                <button type='button' onClick={() => handleJoinRoom(chatRoom.roomId)}>
                  참가하기
                </button>
                <button type='button' onClick={() => handleLeaveRoom(chatRoom.roomId)}>
                  나가기
                </button>
                <button type='button' onClick={() => handleDeleteRoom(chatRoom.roomId)}>
                  삭제하기
                </button>
                <ul>
                  {chatRoom.users.map(user => (
                    <li key={user + index}>{user}</li>
                  ))}
                </ul>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Home;

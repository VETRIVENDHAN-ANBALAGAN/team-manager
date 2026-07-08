import { io, Socket } from 'socket.io-client';

const getSocketToken = () => {
  return localStorage.getItem('ims_jwt_token') || '';
};

const getSocketUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5001';
};

// ✅ Dynamically point to backend URL to support cross-domain hosting
export const socket: Socket = io(getSocketUrl(), {
  autoConnect: false,
  transports: ['websocket', 'polling'], // Forces clean protocol fallback
  withCredentials: true,                // Allows authentication cookies/headers to pass cleanly
  auth: (cb) => {
    cb({ token: getSocketToken() });
  }
});

export const connectSocket = () => {
  const token = getSocketToken();
  if (token) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
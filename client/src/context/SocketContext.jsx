import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getRooms as fetchRooms } from '../api/chatApi';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [activeRoomId, setActiveRoomId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || isAdmin) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      setRooms([]);
      setMessages({});
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5
    });

    socket.on('connect', () => {
      setConnected(true);
      loadRooms();
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on('new:message', (message) => {
      setMessages((prev) => {
        const roomMessages = prev[message.room] || [];
        const exists = roomMessages.some((m) => m._id === message._id);
        if (exists) return prev;
        return {
          ...prev,
          [message.room]: [...roomMessages, message]
        };
      });
      setRooms((prev) =>
        prev.map((r) =>
          r._id === message.room
            ? {
                ...r,
                lastMessage: {
                  content: message.content,
                  sender: message.sender?._id,
                  timestamp: message.createdAt
                }
              }
            : r
        )
      );
    });

    socket.on('new:notification', ({ roomId }) => {
      loadRooms();
    });

    socket.on('typing', ({ roomId, userId, fullName }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [roomId]: { userId, fullName }
      }));
    });

    socket.on('stop:typing', ({ roomId }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[roomId];
        return next;
      });
    });

    socket.on('error', ({ message }) => {
      console.error('Socket error:', message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, isAdmin]);

  const loadRooms = useCallback(async () => {
    try {
      const data = await fetchRooms();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  }, []);

  const joinRoom = useCallback((roomId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join:chat', roomId);
    }
    setActiveRoomId(roomId);
  }, []);

  const leaveRoom = useCallback((roomId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave:chat', roomId);
    }
    setActiveRoomId((prev) => (prev === roomId ? null : prev));
  }, []);

  const sendMessage = useCallback((roomId, content) => {
    return new Promise((resolve) => {
      if (!socketRef.current?.connected) {
        resolve({ error: 'Not connected' });
        return;
      }
      socketRef.current.emit('send:message', { roomId, content }, (response) => {
        resolve(response);
      });
    });
  }, []);

  const emitTyping = useCallback((roomId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { roomId });
    }
  }, []);

  const emitStopTyping = useCallback((roomId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('stop:typing', { roomId });
    }
  }, []);

  const setRoomMessages = useCallback((roomId, msgs) => {
    setMessages((prev) => ({
      ...prev,
      [roomId]: msgs
    }));
  }, []);

  const removeRoom = useCallback((roomId) => {
    setRooms((prev) => prev.filter((r) => r._id !== roomId));
    setMessages((prev) => {
      const next = { ...prev };
      delete next[roomId];
      return next;
    });
  }, []);

  const value = {
    connected,
    rooms,
    messages,
    typingUsers,
    activeRoomId,
    loadRooms,
    joinRoom,
    leaveRoom,
    sendMessage,
    emitTyping,
    emitStopTyping,
    setRoomMessages,
    removeRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;

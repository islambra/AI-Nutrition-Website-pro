import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';
import { getMessages as fetchMessages } from '../../api/chatApi';
import { motion, AnimatePresence } from 'framer-motion';
import RoomList from './RoomList';
import MessageList from './MessageList';
import UserProfileCard from './UserProfileCard';

export default function ChatWindow() {
  const { user } = useAuth();
  const { closeChat } = useChat();
  const {
    rooms,
    messages,
    typingUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    emitTyping,
    emitStopTyping,
    setRoomMessages,
    loadRooms
  } = useSocket();

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleSelectRoom = useCallback(async (room) => {
    if (selectedRoom) {
      leaveRoom(selectedRoom._id);
    }
    setSelectedRoom(room);
    joinRoom(room._id);

    if (!messages[room._id] || messages[room._id].length === 0) {
      setLoadingMessages(true);
      try {
        const data = await fetchMessages(room._id);
        if (data.success) {
          setRoomMessages(room._id, data.messages);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    }
  }, [selectedRoom, joinRoom, leaveRoom, messages, setRoomMessages]);

  const handleBack = useCallback(() => {
    if (selectedRoom) {
      leaveRoom(selectedRoom._id);
    }
    setSelectedRoom(null);
  }, [selectedRoom, leaveRoom]);

  const handleSendMessage = useCallback((content) => {
    if (selectedRoom) {
      sendMessage(selectedRoom._id, content);
    }
  }, [selectedRoom, sendMessage]);

  const handleClose = useCallback(() => {
    if (selectedRoom) {
      leaveRoom(selectedRoom._id);
    }
    setSelectedRoom(null);
    closeChat();
  }, [selectedRoom, leaveRoom, closeChat]);

  const handleShowProfile = useCallback((profileUserData) => {
    setProfileUser(profileUserData);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setProfileUser(null);
  }, []);

  const roomTypingUser = selectedRoom ? typingUsers[selectedRoom._id] : null;
  const roomMessages = selectedRoom ? (messages[selectedRoom._id] || []) : [];

  const otherParticipant = selectedRoom
    ? selectedRoom.participants?.find((p) => p.user?._id !== user?._id)?.user
    : null;

  const messageListRoom = selectedRoom
    ? { ...selectedRoom, emitTyping, emitStopTyping }
    : null;

  return (
    <div className="h-full bg-white rounded-2xl shadow-xl shadow-gray-200/80 border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="relative flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
        {/* Profile card */}
        <AnimatePresence>
          {profileUser && (
            <UserProfileCard user={profileUser} onClose={handleCloseProfile} />
          )}
        </AnimatePresence>
        <div className="flex items-center gap-3 min-w-0">
          <AnimatePresence mode="wait">
            {selectedRoom ? (
              <motion.div
                key="room"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 min-w-0"
              >
                <button
                  onClick={handleBack}
                    className="text-gray-400 hover:text-gray-700 transition-colors shrink-0 p-1 -ml-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {otherParticipant && (
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShowProfile(otherParticipant); }}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center overflow-hidden ring-2 ring-gray-200 shrink-0 hover:ring-emerald-300 transition-all duration-200 relative"
                    >
                      {otherParticipant.photo ? (
                        <img src={otherParticipant.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                          <span className="text-emerald-600 font-semibold text-sm">
                          {otherParticipant.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className="text-gray-900 font-medium text-sm truncate leading-tight">
                        {otherParticipant.fullName || 'Unknown'}
                      </p>
                      <p className="text-gray-500 text-[11px] truncate leading-tight mt-0.5">
                        {otherParticipant.email || ''}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center ring-1 ring-emerald-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-gray-900 font-semibold text-sm">Messages</h2>
                  <p className="text-gray-400 text-[11px]">Your conversations</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 ml-3 p-1.5 rounded-lg hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedRoom ? (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-gray-400 text-xs">Loading messages...</p>
                  </div>
                </div>
              ) : (
                <MessageList
                  messages={roomMessages}
                  room={messageListRoom}
                  onSendMessage={handleSendMessage}
                  typingUser={roomTypingUser}
                  otherParticipant={otherParticipant}
                  onShowProfile={handleShowProfile}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="rooms"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <RoomList
                rooms={rooms}
                onSelectRoom={handleSelectRoom}
                typingUsers={typingUsers}
                onShowProfile={handleShowProfile}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

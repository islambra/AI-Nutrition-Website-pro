import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function MessageList({ messages, room, onSendMessage, typingUser, otherParticipant, onShowProfile }) {
  const { user } = useAuth();
  const { emitTyping, emitStopTyping } = useSocket();
  const userId = user?._id;
  const bottomRef = useRef(null);
  const [input, setInput] = useState('');
  const typingTimeoutRef = useRef(null);
  const roomId = room?._id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (emitTyping && roomId) {
      emitTyping(roomId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (emitStopTyping && roomId) emitStopTyping(roomId);
      }, 2000);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
    if (emitStopTyping && roomId) emitStopTyping(roomId);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateSeparator = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getDateSeparator = (msg, idx) => {
    if (idx === 0) return formatDateSeparator(msg.createdAt);
    const prevDate = new Date(messages[idx - 1].createdAt).toDateString();
    const currDate = new Date(msg.createdAt).toDateString();
    return prevDate !== currDate ? formatDateSeparator(msg.createdAt) : null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center ring-1 ring-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">No messages yet</p>
              <p className="text-gray-400 text-xs mt-1">Send a message to start the conversation!</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const separator = getDateSeparator(msg, idx);
          const isOwn = msg.sender?._id === userId || msg.sender === userId;
          const sender = msg.sender || {};

          return (
            <div key={msg._id || idx}>
              {separator && (
                  <div className="flex justify-center my-6">
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-emerald-200 to-emerald-400/50 rounded-full" />
                      <span className="text-sm text-white bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-1.5 rounded-full shadow-md shadow-emerald-500/25 font-semibold whitespace-nowrap tracking-wide">
                        {separator}
                      </span>
                      <div className="flex-1 h-[2px] bg-gradient-to-r from-emerald-400/50 via-emerald-200 to-transparent rounded-full" />
                    </div>
                  </div>
              )}

              <div className={`flex gap-3 mb-4 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Sender avatar for every message */}
                <button
                  onClick={(e) => { e.stopPropagation(); onShowProfile(isOwn ? user : sender); }}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center overflow-hidden ring-2 ring-gray-200 shrink-0 mt-0.5 shadow-lg shadow-gray-200/50 hover:ring-emerald-300 transition-all duration-200"
                >
                  {(isOwn ? user?.photo : sender.photo) ? (
                    <img src={isOwn ? user?.photo : sender.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-emerald-600 font-semibold text-xs">
                      {(isOwn ? user?.fullName : sender.fullName)?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  )}
                </button>

                {/* Message bubble */}
                <div className={`flex flex-col max-w-[78%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div className="px-4 py-2.5 text-sm leading-relaxed break-words bg-gray-100 text-gray-800 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 px-1">
                    <p className={`text-[10px] text-gray-300 font-mono ${isOwn ? 'order-1' : 'order-0'}`}>
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {typingUser && (
          <div className="flex gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center overflow-hidden ring-2 ring-gray-200 shrink-0 mt-0.5 shadow-lg shadow-gray-200/50">
              {otherParticipant?.photo ? (
                <img src={otherParticipant.photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-emerald-600 font-semibold text-xs">
                  {otherParticipant?.fullName?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            <div className="flex flex-col items-start max-w-[78%]">
              <div className="flex items-center gap-2 mb-1.5 px-1">
                <span className="text-gray-700 text-[11px] font-medium tracking-wide">
                  {typingUser.fullName}
                </span>
              </div>
              <div className="bg-gray-100 text-gray-400 rounded-2xl rounded-bl-sm px-5 py-3.5 border border-gray-100">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3.5 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-emerald-400 focus-within:bg-white transition-all duration-200 px-4">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-gray-900 py-2.5 text-sm outline-none placeholder-gray-400"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

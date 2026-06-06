import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';
import ChatWindow from './ChatWindow';

export default function ChatBubble() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { rooms } = useSocket();
  const { chatOpen, toggleChat } = useChat();

  if (!isAuthenticated || isAdmin()) return null;

  const totalUnread = rooms?.filter(r => {
    const lastMsg = r.lastMessage;
    return lastMsg && lastMsg.sender && lastMsg.sender !== r.participants?.[0]?.user?._id;
  }).length || 0;

  return (
    <>
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={toggleChat}
          />
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/45 active:shadow-emerald-500/60 transition-shadow duration-300 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Chat"
      >
        <AnimatePresence mode="wait">
          {chatOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
              xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </motion.svg>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!chatOpen && totalUnread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-lg shadow-rose-500/40"
            >
              {totalUnread > 9 ? '9+' : totalUnread}
            </motion.span>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.button>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[440px] max-w-[calc(100vw-3rem)] h-[620px] max-h-[calc(100vh-8rem)]"
          >
            <ChatWindow />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

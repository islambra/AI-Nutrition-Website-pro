import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { deleteRoom as deleteRoomApi } from '../../api/chatApi';
import toast from 'react-hot-toast';
import './RoomList.css';

export default function RoomList({ rooms, onSelectRoom, typingUsers, onShowProfile }) {
  const { t } = useTranslation();
  const { removeRoom } = useSocket();
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useAuth();
  const userId = user?._id;

  const getOtherParticipant = (room) => {
    const other = room.participants?.find((p) => p.user?._id !== userId);
    return other?.user || { fullName: 'Unknown', photo: null, email: '' };
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!rooms || rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-10 text-center">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center mb-5 ring-1 ring-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium text-sm">{t('chat.noConversations')}</p>
        <p className="text-gray-400 text-xs mt-2 max-w-[220px] leading-relaxed">
          {t('chat.startConversation')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scroll-smooth divide-y divide-gray-100">
        {rooms.map((room) => {
          const other = getOtherParticipant(room);
          const isTyping = typingUsers[room._id];

          return (
            <div
              key={room._id}
              className="group relative"
            >
              <button
                onClick={() => onSelectRoom(room)}
                className="w-full flex items-center gap-4 px-5 py-4.5 hover:bg-gray-50 active:bg-gray-100 transition-all duration-150 text-left relative"
              >
                <div className="relative shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); onShowProfile(other); }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center overflow-hidden ring-2 ring-gray-200 hover:ring-emerald-300 transition-all duration-300"
                  >
                    {other.photo ? (
                      <img src={other.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-emerald-600 font-semibold text-base">
                        {other.fullName?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    )}
                  </button>
                  {isTyping && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-gray-900 font-medium text-sm truncate">{other.fullName || t('chat.unknown')}</p>
                    <span className="text-gray-300 text-[11px] shrink-0 font-mono">
                      {room.lastMessage?.timestamp ? formatTime(room.lastMessage.timestamp) : ''}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] truncate mt-0.5">{other.email || ''}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {isTyping ? (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-emerald-600 text-xs ml-1 italic">{t('chat.typing')}</span>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs truncate leading-relaxed">
                        {room.lastMessage?.content || (
                          <span className="italic text-gray-300">{t('chat.noMessages')}</span>
                        )}
                      </p>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-medium tracking-wide ${
                      room.type === 'plan'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-violet-50 text-violet-600'
                    }`}>
                      {room.type === 'plan' ? t('chat.plan') : t('chat.formation')}
                    </span>
                  </div>
                </div>
              </button>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDeleteId(room._id);
                }}
                disabled={deletingId === room._id}
                className="rl-delete-btn absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/80 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-sm border border-gray-200"
                title={t('chat.deleteConversation')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="rl-modal-overlay"
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="rl-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="rl-modal-close"
                onClick={() => setConfirmDeleteId(null)}
              >
                <X size={18} />
              </button>

              <div className="rl-modal-icon-wrap">
                <div className="rl-modal-icon">
                  <AlertTriangle size={28} />
                </div>
              </div>

              <h3 className="rl-modal-title">{t('chat.deleteConversation')}</h3>
              <p className="rl-modal-message">
                {t('chat.deleteConfirm')}
              </p>

              <div className="rl-modal-actions">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="rl-modal-btn cancel"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  {t('common.cancel')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="rl-modal-btn confirm"
                  disabled={deletingId === confirmDeleteId}
                  onClick={() => {
                    if (!confirmDeleteId) return;
                    setDeletingId(confirmDeleteId);
                    deleteRoomApi(confirmDeleteId)
                      .then(() => { removeRoom(confirmDeleteId); })
                      .catch(() => { toast.error(t('common.error')); })
                      .finally(() => { setDeletingId(null); setConfirmDeleteId(null); });
                  }}
                >
                  <Trash2 size={16} />
                  {deletingId === confirmDeleteId ? t('common.loading') : t('common.delete')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

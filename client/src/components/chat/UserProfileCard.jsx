import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';

export default function UserProfileCard({ user, onClose }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user?._id) return;
    axiosInstance.get(`/user/public-profile/${user._id}`)
      .then(res => setProfile(res.data))
      .catch(() => setProfile(null));
  }, [user?._id]);

  if (!user) return null;

  const displayData = profile || user;

  const roleLabel = displayData.role
    ? displayData.role.charAt(0).toUpperCase() + displayData.role.slice(1)
    : 'User';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute -top-2 left-0 z-50 w-64 bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/80 overflow-hidden"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header gradient */}
      <div className="h-20 bg-gradient-to-br from-emerald-100 via-emerald-50 to-transparent" />

      {/* Avatar */}
      <div className="flex justify-center -mt-10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center overflow-hidden ring-4 ring-white ring-offset-2 ring-offset-white shadow-xl shadow-emerald-500/10">
          {displayData.photo ? (
            <img src={displayData.photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-emerald-600 font-bold text-2xl">
              {displayData.fullName?.charAt(0)?.toUpperCase() || '?'}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-5 pb-5 pt-4 text-center">
        <h3 className="text-gray-900 font-semibold text-base truncate">{displayData.fullName || 'Unknown'}</h3>
        <p className="text-gray-500 text-xs mt-1.5 truncate">{displayData.email || ''}</p>

        {displayData.specialty && (
          <p className="text-emerald-600 text-[11px] mt-2 font-medium">
            {displayData.specialty}
          </p>
        )}

        <div className="flex justify-center mt-3">
          <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 tracking-wide">
            {roleLabel}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

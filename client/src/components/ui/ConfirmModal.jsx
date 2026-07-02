import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function ConfirmModal({ isOpen, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, variant = 'danger' }) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="cmp-confirm-modal">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/20"
            onClick={onCancel}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="px-6 pt-6 pb-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  variant === 'danger' ? 'bg-red-50' : 'bg-emerald-50'
                }`}>
                  {variant === 'danger' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-gray-900 font-semibold text-base">{title || t('common.confirm')}</h3>
                <p className="text-gray-500 text-sm mt-1.5">{message || t('common.confirm')}</p>
              </div>
              <div className="flex gap-2 px-6 pb-6 pt-4">
                <button
                  onClick={onCancel}
                  className="flex-1 h-10 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {cancelLabel || t('common.cancel')}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 h-10 rounded-xl text-sm font-medium text-white transition-colors ${
                    variant === 'danger'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                >
                  {confirmLabel || t('common.delete')}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

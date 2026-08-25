import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white text-taruvar-dark px-5 py-3.5 rounded-2xl shadow-2xl border border-taruvar-border animate-slide-up">
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-taruvar-primary shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
      )}
      <p className="text-sm font-medium text-taruvar-dark">{message}</p>
      <button 
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-600 transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

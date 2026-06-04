import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#1A1A1A] border border-white/10 rounded-none w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-xl font-outfit font-bold text-white leading-tight">
              {title}
            </h3>
          </div>
          <p className="text-white/70 font-outfit text-sm">
            {message}
          </p>
        </div>
        <div className="flex bg-[#161A23]/50 p-4 gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-none text-white/70 hover:text-white hover:bg-white/10 transition-colors font-outfit font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-none bg-red-600 hover:bg-red-500 text-white transition-colors font-outfit font-bold text-sm shadow-lg shadow-red-500/20"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

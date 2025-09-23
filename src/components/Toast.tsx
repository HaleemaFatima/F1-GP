import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useStore } from '../store/useStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colors = {
    success: 'bg-success/90',
    error: 'bg-error/90',
    warning: 'bg-warning/90',
    info: 'bg-blue-500/90'
  };

  const Icon = icons[type];

  return (
    <div className={`${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg slide-in-top flex items-center space-x-3 max-w-sm`}>
      <Icon size={20} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 transition-colors focus-visible"
      >
        <X size={16} />
      </button>
    </div>
  );
};
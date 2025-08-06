import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastType } from '../contexts/ToastContext';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, type, visible }) => {
  if (!visible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500 dark:bg-green-600',
          border: 'border-green-600 dark:border-green-700',
          icon: <CheckCircle className="h-5 w-5 text-green-100" />,
          text: 'text-green-100'
        };
      case 'error':
        return {
          bg: 'bg-red-500 dark:bg-red-600',
          border: 'border-red-600 dark:border-red-700',
          icon: <XCircle className="h-5 w-5 text-red-100" />,
          text: 'text-red-100'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500 dark:bg-yellow-600',
          border: 'border-yellow-600 dark:border-yellow-700',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-100" />,
          text: 'text-yellow-100'
        };
      case 'info':
        return {
          bg: 'bg-blue-500 dark:bg-blue-600',
          border: 'border-blue-600 dark:border-blue-700',
          icon: <Info className="h-5 w-5 text-blue-100" />,
          text: 'text-blue-100'
        };
      default:
        return {
          bg: 'bg-gray-500 dark:bg-gray-600',
          border: 'border-gray-600 dark:border-gray-700',
          icon: <Info className="h-5 w-5 text-gray-100" />,
          text: 'text-gray-100'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className={`
      ${styles.bg} ${styles.border} border-l-4
      text-white px-4 py-3 rounded-lg shadow-lg
      min-w-[300px] max-w-[400px]
      animate-slide-in-right
      transition-all duration-300 ease-in-out
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {styles.icon}
          <span className={`${styles.text} font-medium`}>
            {message}
          </span>
        </div>
        <button className="text-white/80 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast; 
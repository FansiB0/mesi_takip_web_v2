import React from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed left-4 bottom-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out transition-all">
      {message}
    </div>
  );
};

export default Toast; 
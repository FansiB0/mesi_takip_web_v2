import React from 'react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import { ErrorType, ERROR_MESSAGES } from '../utils/errorHandler';

interface ErrorDisplayProps {
  error?: string;
  errorType?: ErrorType;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
  variant?: 'inline' | 'card' | 'banner';
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errorType = ErrorType.UNKNOWN,
  onRetry,
  onDismiss,
  className = '',
  showIcon = true,
  variant = 'inline'
}) => {
  if (!error) return null;

  const errorInfo = ERROR_MESSAGES[errorType];

  const baseClasses = 'flex items-start gap-3 p-4 rounded-lg';
  const variantClasses = {
    inline: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
    card: 'bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 shadow-sm',
    banner: 'bg-red-600 text-white'
  };

  const textClasses = variant === 'banner' 
    ? 'text-white' 
    : 'text-red-800 dark:text-red-200';

  const iconClasses = variant === 'banner' 
    ? 'text-white' 
    : 'text-red-600 dark:text-red-400';

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {showIcon && (
        <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconClasses}`} />
      )}
      
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium ${textClasses}`}>
          {errorInfo.title}
        </h3>
        <p className={`text-sm mt-1 ${textClasses} opacity-90`}>
          {error}
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className={`
              inline-flex items-center gap-2 mt-3 text-sm font-medium transition-colors
              ${variant === 'banner' 
                ? 'text-white hover:text-red-100' 
                : 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
              }
            `}
          >
            <RefreshCw className="h-4 w-4" />
            Tekrar Dene
          </button>
        )}
      </div>
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`
            flex-shrink-0 p-1 rounded transition-colors
            ${variant === 'banner' 
              ? 'text-white hover:bg-red-700' 
              : 'text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400'
            }
          `}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay; 
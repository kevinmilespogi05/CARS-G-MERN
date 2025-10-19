import React from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
  autoHide?: boolean;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ 
  message, 
  onDismiss, 
  autoHide = true 
}) => {
  React.useEffect(() => {
    if (autoHide && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoHide, onDismiss]);

  return (
    <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <CheckCircle className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onDismiss && (
          <div className="ml-3">
            <button
              onClick={onDismiss}
              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessMessage;

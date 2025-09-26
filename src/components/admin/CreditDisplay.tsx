import React from 'react';
import { useCredits } from '../../hooks/useCredits';

interface CreditDisplayProps {
  size?: 'compact' | 'full';
  showUsage?: boolean;
  showIcon?: boolean;
  className?: string;
}

const CreditIcon: React.FC<{ threshold: string; size: string }> = ({ threshold, size }) => {
  const iconSize = size === 'compact' ? 'w-4 h-4' : 'w-6 h-6';
  
  switch (threshold) {
    case 'healthy':
      return <span className={`${iconSize} flex items-center justify-center text-green-600`}>⚡</span>;
    case 'warning':
      return <span className={`${iconSize} flex items-center justify-center text-yellow-600`}>⚠️</span>;
    case 'critical':
      return <span className={`${iconSize} flex items-center justify-center text-red-600`}>🔥</span>;
    case 'depleted':
      return <span className={`${iconSize} flex items-center justify-center text-gray-600`}>🔒</span>;
    default:
      return <span className={`${iconSize} flex items-center justify-center text-gray-400`}>⚡</span>;
  }
};

const CreditUsageBar: React.FC<{ percentage: number; threshold: string }> = ({ 
  percentage, 
  threshold 
}) => {
  const getBarColor = () => {
    switch (threshold) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      case 'depleted':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${getBarColor()}`}
        style={{ width: `${Math.max(percentage, 2)}%` }}
      />
    </div>
  );
};

export const CreditDisplay: React.FC<CreditDisplayProps> = ({
  size = 'compact',
  showUsage = false,
  showIcon = true,
  className = ''
}) => {
  const { credits, loading, error, threshold } = useCredits();

  if (loading) {
    return (
      <div className={`credit-display loading ${size} ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`credit-display error ${size} ${className}`}>
        <div className="flex items-center space-x-2">
          <span className="text-red-500">❌</span>
          <span className="text-sm text-red-600">Error</span>
        </div>
      </div>
    );
  }

  const getThemeClasses = () => {
    const baseClasses = 'flex items-center rounded-lg border transition-all duration-200';
    
    switch (threshold) {
      case 'healthy':
        return `${baseClasses} text-green-700 bg-green-50 border-green-200`;
      case 'warning':
        return `${baseClasses} text-yellow-700 bg-yellow-50 border-yellow-200`;
      case 'critical':
        return `${baseClasses} text-red-700 bg-red-50 border-red-200`;
      case 'depleted':
        return `${baseClasses} text-gray-700 bg-gray-50 border-gray-200`;
      default:
        return `${baseClasses} text-gray-600 bg-gray-50 border-gray-200`;
    }
  };

  const getSizeClasses = () => {
    return size === 'compact' ? 'px-3 py-2 space-x-2' : 'px-4 py-3 space-x-3';
  };

  const getTextSize = () => {
    return size === 'compact' ? 'text-sm' : 'text-base';
  };

  const percentage = (credits / 100) * 100; // Assuming 100 total credits

  return (
    <div className={`credit-display ${getThemeClasses()} ${getSizeClasses()} ${className}`}>
      {showIcon && (
        <CreditIcon threshold={threshold} size={size} />
      )}
      
      <div className="flex flex-col">
        <div className="flex items-center space-x-1">
          <span className={`font-semibold ${getTextSize()}`}>
            {credits}
          </span>
          <span className={`text-gray-500 ${size === 'compact' ? 'text-xs' : 'text-sm'}`}>
            / 100
          </span>
          <span className={`text-gray-500 ${size === 'compact' ? 'text-xs' : 'text-sm'}`}>
            credits
          </span>
        </div>
        
        {showUsage && size === 'full' && (
          <CreditUsageBar percentage={percentage} threshold={threshold} />
        )}
      </div>
      
      {threshold === 'depleted' && (
        <div className="ml-2">
          <span className={`${size === 'compact' ? 'text-xs' : 'text-sm'} text-gray-600`}>
            No credits
          </span>
        </div>
      )}
    </div>
  );
};

// Separate component for upgrade messaging
export const CreditUpgradeMessage: React.FC<{ 
  credits: number;
  onUpgradeClick?: () => void;
}> = ({ 
  credits, 
  onUpgradeClick 
}) => {
  if (credits > 5) return null;

  const getMessage = () => {
    if (credits === 0) {
      return {
        title: 'No Credits Remaining',
        message: 'Your admin team has exhausted all processing credits.',
        urgency: 'high'
      };
    }
    if (credits <= 1) {
      return {
        title: 'Critical: Only 1 Credit Left',
        message: 'Consider purchasing more credits before your next processing session.',
        urgency: 'high'
      };
    }
    if (credits <= 5) {
      return {
        title: 'Low Credits Warning',
        message: `Only ${credits} credits remaining. Plan for additional credits soon.`,
        urgency: 'medium'
      };
    }
    return null;
  };

  const messageInfo = getMessage();
  if (!messageInfo) return null;

  const getAlertClasses = () => {
    const baseClasses = 'rounded-lg border p-4 mt-3';
    
    switch (messageInfo.urgency) {
      case 'high':
        return `${baseClasses} bg-red-50 border-red-200 text-red-800`;
      case 'medium':
        return `${baseClasses} bg-yellow-50 border-yellow-200 text-yellow-800`;
      default:
        return `${baseClasses} bg-blue-50 border-blue-200 text-blue-800`;
    }
  };

  return (
    <div className={getAlertClasses()}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {messageInfo.urgency === 'high' ? '🚨' : '⚠️'}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{messageInfo.title}</h4>
          <p className="text-sm mt-1">{messageInfo.message}</p>
          
          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Purchase More Credits
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditDisplay;
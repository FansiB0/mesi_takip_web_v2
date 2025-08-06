import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'yellow';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change = 0,
  changeLabel,
  icon: Icon,
  color
}) => {
  const colorClasses = {
    green: {
      icon: 'bg-green-600',
      change: change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
    },
    blue: {
      icon: 'bg-blue-600',
      change: change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
    },
    purple: {
      icon: 'bg-purple-600',
      change: change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
    },
    orange: {
      icon: 'bg-orange-600',
      change: change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
    },
    red: {
      icon: 'bg-red-600',
      change: change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
    },
    yellow: {
      icon: 'bg-yellow-600',
      change: change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
    }
  };

  const colorClass = colorClasses[color];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {changeLabel && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-medium ${colorClass.change}`}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {changeLabel}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClass.icon}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
import React from 'react';
import { ProjectStatistics } from '../types';

interface StatisticsCardProps {
  statistics: ProjectStatistics;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ statistics }) => {
  const stats = [
    {
      label: 'Total Projects',
      value: statistics.totalProjects,
      color: 'bg-blue-500',
    },
    {
      label: 'Active Projects',
      value: statistics.activeProjects,
      color: 'bg-green-500',
    },
    {
      label: 'Completed Projects',
      value: statistics.completedProjects,
      color: 'bg-purple-500',
    },
    {
      label: 'Total Tasks',
      value: statistics.totalTasks,
      color: 'bg-orange-500',
    },
    {
      label: 'Completed Tasks',
      value: statistics.completedTasks,
      color: 'bg-teal-500',
    },
    {
      label: 'Completion Rate',
      value: `${statistics.overallCompletionRate}%`,
      color: 'bg-primary-500',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`${stat.color} text-white rounded-lg p-4 mb-2`}>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsCard;


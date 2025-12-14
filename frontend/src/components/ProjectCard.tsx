import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
  onEdit: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, onEdit }) => {
  if (!project || !project.id) {
    return null;
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <h3
          className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-primary-600 transition-colors"
          onClick={onSelect}
        >
          {project.name}
        </h3>
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Edit project"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description || 'No description'}</p>

      <div className="flex items-center justify-between mb-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
        >
          {project.status.replace('_', ' ')}
        </span>
        <span className="text-sm text-gray-500">{formatDate(project.dueDate)}</span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{project.completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.completionRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span>{project.completedTasks} of {project.taskCount} tasks completed</span>
        </div>
      </div>

      <button
        onClick={onSelect}
        className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
      >
        View Tasks
      </button>
    </div>
  );
};

export default ProjectCard;


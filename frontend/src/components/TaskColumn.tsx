import React from 'react';
import { Task } from '../types';

interface TaskColumnProps {
  status: string;
  label: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  label,
  tasks,
  onTaskClick,
  onTaskEdit,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'border-gray-300 bg-gray-50';
      case 'IN_PROGRESS':
        return 'border-blue-300 bg-blue-50';
      case 'DONE':
        return 'border-green-300 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="flex flex-col">
      <div className={`rounded-t-lg p-4 border-2 ${getStatusColor(status)}`}>
        <h3 className="font-semibold text-gray-900">{label}</h3>
        <span className="text-sm text-gray-600">({tasks.length})</span>
      </div>
      <div className="border-2 border-t-0 rounded-b-lg p-4 min-h-[400px] space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            No tasks in this column
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
              onClick={() => onTaskClick(task)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskEdit(task);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Edit task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </div>
              {task.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
              )}
              {task.assigneeEmail && (
                <p className="text-xs text-gray-500 mb-1">
                  <span className="font-medium">Assignee:</span> {task.assigneeEmail}
                </p>
              )}
              {task.dueDate && (
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Due:</span>{' '}
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskColumn;


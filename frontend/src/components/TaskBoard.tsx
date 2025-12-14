import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_TASKS, GET_PROJECT } from '../graphql/queries';
import { Task } from '../types';
import TaskColumn from './TaskColumn';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface TaskBoardProps {
  projectId: string;
  organizationSlug: string;
  onBack: () => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ projectId, organizationSlug, onBack }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { loading, error, data, refetch } = useQuery(GET_TASKS, {
    variables: {
      projectId,
      organizationSlug,
    },
  });

  const { data: projectData } = useQuery(GET_PROJECT, {
    variables: {
      id: projectId,
      organizationSlug,
    },
  });

  const tasks: Task[] = data?.tasks || [];
  const project = projectData?.project;

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
    refetch();
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const statusColumns = [
    { status: 'TODO', label: 'To Do', color: 'bg-gray-100' },
    { status: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100' },
    { status: 'DONE', label: 'Done', color: 'bg-green-100' },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {project?.name || 'Tasks'}
          </h2>
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          + New Task
        </button>
      </div>

      {error && <ErrorMessage message="Failed to load tasks" />}

      {showForm && (
        <TaskForm
          projectId={projectId}
          organizationSlug={organizationSlug}
          task={editingTask}
          onClose={handleFormClose}
        />
      )}

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          organizationSlug={organizationSlug}
          onClose={() => setSelectedTask(null)}
          onEdit={() => {
            setSelectedTask(null);
            handleEdit(selectedTask);
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusColumns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.status);
          return (
            <TaskColumn
              key={column.status}
              status={column.status}
              label={column.label}
              tasks={columnTasks}
              onTaskClick={setSelectedTask}
              onTaskEdit={handleEdit}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TaskBoard;


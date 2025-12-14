import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TASK } from '../graphql/queries';
import { CREATE_TASK_COMMENT } from '../graphql/mutations';
import { Task } from '../types';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

interface TaskDetailProps {
  task: Task;
  organizationSlug: string;
  onClose: () => void;
  onEdit: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  organizationSlug,
  onClose,
  onEdit,
}) => {
  const [commentContent, setCommentContent] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);

  const { loading, error, data } = useQuery(GET_TASK, {
    variables: {
      id: task.id,
      organizationSlug,
    },
  });

  const [createComment, { loading: creating }] = useMutation(CREATE_TASK_COMMENT, {
    refetchQueries: [
      { query: GET_TASK, variables: { id: task.id, organizationSlug } },
    ],
    onCompleted: () => {
      setCommentContent('');
      setAuthorEmail('');
      setShowCommentForm(false);
    },
    onError: (error) => {
      console.error('Error creating comment:', error);
    },
  });

  const taskData = data?.task || task;
  const comments = taskData.comments || [];

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !authorEmail.trim()) {
      return;
    }

    createComment({
      variables: {
        taskId: task.id,
        organizationSlug,
        content: commentContent.trim(),
        authorEmail: authorEmail.trim(),
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'DONE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{taskData.title}</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {error && <ErrorMessage message="Failed to load task details" />}

          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(taskData.status)}`}
                >
                  {taskData.status.replace('_', ' ')}
                </span>
                {taskData.assigneeEmail && (
                  <span className="text-sm text-gray-600">
                    Assigned to: <span className="font-medium">{taskData.assigneeEmail}</span>
                  </span>
                )}
                {taskData.dueDate && (
                  <span className="text-sm text-gray-600">
                    Due: <span className="font-medium">
                      {new Date(taskData.dueDate).toLocaleDateString()}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{taskData.description || 'No description'}</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                <button
                  onClick={() => setShowCommentForm(!showCommentForm)}
                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  + Add Comment
                </button>
              </div>

              {showCommentForm && (
                <form onSubmit={handleSubmitComment} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="mb-3">
                    <label htmlFor="authorEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      id="authorEmail"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                      disabled={creating}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="commentContent" className="block text-sm font-medium text-gray-700 mb-1">
                      Comment *
                    </label>
                    <textarea
                      id="commentContent"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                      disabled={creating}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCommentForm(false);
                        setCommentContent('');
                        setAuthorEmail('');
                      }}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={creating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                      disabled={creating}
                    >
                      {creating ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              )}

              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{comment.authorEmail}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;


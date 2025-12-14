import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PROJECTS, GET_PROJECT_STATISTICS } from '../graphql/queries';
import { Project, ProjectStatistics } from '../types';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import StatisticsCard from './StatisticsCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface ProjectDashboardProps {
  organizationSlug: string;
  onSelectProject: (projectId: string) => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  organizationSlug,
  onSelectProject,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { loading, error, data, refetch } = useQuery(GET_PROJECTS, {
    variables: {
      organizationSlug,
      status: statusFilter || null,
    },
    skip: !organizationSlug, // Don't run query if no organization selected
    errorPolicy: 'all', // Continue even if there are errors
  });

  const {
    loading: statsLoading,
    error: statsError,
    data: statsData,
  } = useQuery(GET_PROJECT_STATISTICS, {
    variables: { organizationSlug },
    skip: !organizationSlug, // Don't run query if no organization selected
    errorPolicy: 'all', // Continue even if there are errors
  });

  // Safely extract and filter projects
  const projects: Project[] = useMemo(() => {
    if (!data?.projects) return [];
    return data.projects
      .filter((p: any): p is Project => 
        p !== null && 
        p !== undefined && 
        p.id !== null && 
        p.id !== undefined &&
        p.organization?.id !== null &&
        p.organization?.id !== undefined
      );
  }, [data]);
  const statistics: ProjectStatistics | null = statsData?.projectStatistics || null;

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProject(null);
    refetch();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  // Show loading state
  if (loading || statsLoading) {
    return <LoadingSpinner />;
  }

  // Log errors for debugging
  if (error) {
    console.error('Projects query error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
  if (statsError) {
    console.error('Statistics query error:', statsError);
  }

  // Show error messages
  if (error) {
    const errorMessage = error.graphQLErrors?.[0]?.message || 
                        error.networkError?.message || 
                        error.message || 
                        'Failed to load projects';
    return (
      <div className="space-y-6">
        <ErrorMessage message={errorMessage} />
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {statsError && (
        <ErrorMessage 
          message={`Failed to load statistics: ${statsError.message || 'Unknown error'}`} 
        />
      )}

      {statistics && <StatisticsCard statistics={statistics} />}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          + New Project
        </button>
      </div>

      {showForm && (
        <ProjectForm
          organizationSlug={organizationSlug}
          project={editingProject}
          onClose={handleFormClose}
        />
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No projects found. Create your first project!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects
            .filter((project): project is Project => project !== null && project !== undefined && project.id !== null && project.id !== undefined)
            .map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={() => onSelectProject(project.id)}
                onEdit={() => handleEdit(project)}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;


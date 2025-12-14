import React, { useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from './apollo/client';
import ProjectDashboard from './components/ProjectDashboard';
import TaskBoard from './components/TaskBoard';
import OrganizationSelector from './components/OrganizationSelector';

function App() {
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'tasks'>('dashboard');

  return (
    <ApolloProvider client={client}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Project Manager</h1>
              <div className="flex items-center space-x-4">
                <OrganizationSelector
                  selectedOrganization={selectedOrganization}
                  onSelectOrganization={setSelectedOrganization}
                />
                {selectedOrganization && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setView('dashboard')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        view === 'dashboard'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Dashboard
                    </button>
                    {selectedProject && (
                      <button
                        onClick={() => setView('tasks')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          view === 'tasks'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Tasks
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!selectedOrganization ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Please select an organization to get started</p>
            </div>
          ) : view === 'dashboard' ? (
            <ProjectDashboard
              organizationSlug={selectedOrganization}
              onSelectProject={(projectId) => {
                setSelectedProject(projectId);
                setView('tasks');
              }}
            />
          ) : (
            selectedProject && (
              <TaskBoard
                projectId={selectedProject}
                organizationSlug={selectedOrganization}
                onBack={() => {
                  setSelectedProject(null);
                  setView('dashboard');
                }}
              />
            )
          )}
        </main>
      </div>
    </ApolloProvider>
  );
}

export default App;


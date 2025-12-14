import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ORGANIZATIONS } from '../graphql/queries';
import { Organization } from '../types';

interface OrganizationSelectorProps {
  selectedOrganization: string | null;
  onSelectOrganization: (slug: string | null) => void;
}

const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
  selectedOrganization,
  onSelectOrganization,
}) => {
  const { loading, error, data } = useQuery(GET_ORGANIZATIONS);

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="text-sm text-red-500">Error loading organizations</div>;

  const organizations: Organization[] = data?.organizations || [];

  if (organizations.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">No organizations found.</span>
        <a
          href="http://localhost:8000/graphql/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-600 hover:text-primary-700 underline"
        >
          Create one via GraphQL
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="organization-select" className="text-sm font-medium text-gray-700">
        Organization:
      </label>
      <select
        id="organization-select"
        value={selectedOrganization || ''}
        onChange={(e) => onSelectOrganization(e.target.value || null)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
      >
        <option value="">Select Organization</option>
        {organizations.map((org) => (
          <option key={org.id} value={org.slug}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OrganizationSelector;


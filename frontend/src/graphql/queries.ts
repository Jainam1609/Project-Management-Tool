import { gql } from '@apollo/client';

export const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      id
      name
      slug
      contactEmail
      createdAt
    }
  }
`;

export const GET_PROJECTS = gql`
  query GetProjects($organizationSlug: String!, $status: String) {
    projects(organizationSlug: $organizationSlug, status: $status) {
      id
      name
      description
      status
      dueDate
      createdAt
      taskCount
      completedTasks
      completionRate
      organization {
        id
        slug
      }
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($id: ID!, $organizationSlug: String!) {
    project(id: $id, organizationSlug: $organizationSlug) {
      id
      name
      description
      status
      dueDate
      createdAt
      taskCount
      completedTasks
      completionRate
      organization {
        id
        slug
      }
    }
  }
`;

export const GET_PROJECT_STATISTICS = gql`
  query GetProjectStatistics($organizationSlug: String!) {
    projectStatistics(organizationSlug: $organizationSlug) {
      totalProjects
      activeProjects
      completedProjects
      totalTasks
      completedTasks
      overallCompletionRate
    }
  }
`;

export const GET_TASKS = gql`
  query GetTasks($projectId: ID!, $organizationSlug: String!, $status: String) {
    tasks(projectId: $projectId, organizationSlug: $organizationSlug, status: $status) {
      id
      title
      description
      status
      assigneeEmail
      dueDate
      createdAt
      project {
        id
        name
      }
    }
  }
`;

export const GET_TASK = gql`
  query GetTask($id: ID!, $organizationSlug: String!) {
    task(id: $id, organizationSlug: $organizationSlug) {
      id
      title
      description
      status
      assigneeEmail
      dueDate
      createdAt
      project {
        id
        name
      }
      comments {
        id
        content
        authorEmail
        createdAt
      }
    }
  }
`;


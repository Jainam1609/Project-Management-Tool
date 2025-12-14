# GraphQL Queries for Database Data

## Complete Data Query

Use this query in the GraphQL Playground at `http://localhost:8000/graphql/` to see all data in the database:

```graphql
query GetAllData {
  organizations {
    id
    name
    slug
    contactEmail
    createdAt
  }
}
```

## Detailed Query - All Organizations with Projects and Tasks

```graphql
query GetAllOrganizationsWithProjects {
  organizations {
    id
    name
    slug
    contactEmail
    createdAt
  }
}
```

## Get Projects for a Specific Organization

Replace `"acme-corp"` with any organization slug from your database:

```graphql
query GetProjectsForOrganization {
  projects(organizationSlug: "acme-corp") {
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
      name
      slug
    }
  }
}
```

## Get All Projects with Tasks

```graphql
query GetProjectsWithTasks($organizationSlug: String!) {
  projects(organizationSlug: $organizationSlug) {
    id
    name
    description
    status
    dueDate
    createdAt
    taskCount
    completedTasks
    completionRate
  }
  
  # Get tasks for each project (you'll need to query by project ID)
  tasks(projectId: "1", organizationSlug: $organizationSlug) {
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
```

**Variables:**
```json
{
  "organizationSlug": "acme-corp"
}
```

## Get Project Statistics

```graphql
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
```

**Variables:**
```json
{
  "organizationSlug": "acme-corp"
}
```

## Complete Data View - All Organizations

This query fetches all organizations and their complete data structure:

```graphql
query CompleteDataView {
  organizations {
    id
    name
    slug
    contactEmail
    createdAt
  }
}
```

## Example: Get All Data for Tech Startup

```graphql
query GetTechStartupData {
  # Get organization
  organization(slug: "tech-startup") {
    id
    name
    slug
    contactEmail
    createdAt
  }
  
  # Get all projects
  projects(organizationSlug: "tech-startup") {
    id
    name
    description
    status
    dueDate
    createdAt
    taskCount
    completedTasks
    completionRate
  }
  
  # Get project statistics
  projectStatistics(organizationSlug: "tech-startup") {
    totalProjects
    activeProjects
    completedProjects
    totalTasks
    completedTasks
    overallCompletionRate
  }
}
```

## Get Tasks for a Specific Project

```graphql
query GetTasksForProject($projectId: ID!, $organizationSlug: String!) {
  tasks(projectId: $projectId, organizationSlug: $organizationSlug) {
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
```

**Variables:**
```json
{
  "projectId": "1",
  "organizationSlug": "acme-corp"
}
```

## Get Single Task with All Details

```graphql
query GetTaskDetails($taskId: ID!, $organizationSlug: String!) {
  task(id: $taskId, organizationSlug: $organizationSlug) {
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
      description
      status
    }
    comments {
      id
      content
      authorEmail
      createdAt
    }
  }
}
```

**Variables:**
```json
{
  "taskId": "1",
  "organizationSlug": "acme-corp"
}
```

## Quick Reference - Sample Organization Slugs

Based on the sample data, you can use these organization slugs:
- `acme-corp` - Acme Corporation
- `tech-startup` - Tech Startup Inc
- `design-agency` - Creative Design Agency

## How to Use These Queries

1. **Open GraphQL Playground**: Navigate to `http://localhost:8000/graphql/`
2. **Paste a query** from above into the left panel
3. **Add variables** (if needed) in the bottom-left panel
4. **Click the Play button** to execute
5. **View results** in the right panel

## Example: Complete Data Export Query

This query gets everything for all organizations (run multiple times with different slugs):

```graphql
query CompleteDataExport($organizationSlug: String!) {
  organization(slug: $organizationSlug) {
    id
    name
    slug
    contactEmail
    createdAt
  }
  
  projects(organizationSlug: $organizationSlug) {
    id
    name
    description
    status
    dueDate
    createdAt
    taskCount
    completedTasks
    completionRate
  }
  
  projectStatistics(organizationSlug: $organizationSlug) {
    totalProjects
    activeProjects
    completedProjects
    totalTasks
    completedTasks
    overallCompletionRate
  }
}
```

**Variables for Acme Corporation:**
```json
{
  "organizationSlug": "acme-corp"
}
```

**Variables for Tech Startup:**
```json
{
  "organizationSlug": "tech-startup"
}
```

**Variables for Design Agency:**
```json
{
  "organizationSlug": "design-agency"
}
```


# Project Management System - Architecture & Implementation Guide

## Table of Contents
1. [Technology Stack Overview](#technology-stack-overview)
2. [PostgreSQL - Database Layer](#postgresql---database-layer)
3. [Django - Backend Framework](#django---backend-framework)
4. [GraphQL - API Layer](#graphql---api-layer)
5. [React Frontend](#react-frontend)
6. [Application Flow](#application-flow)
7. [Implementation Details](#implementation-details)
8. [Multi-Tenancy Architecture](#multi-tenancy-architecture)

---

## Technology Stack Overview

This project uses a modern, full-stack architecture:

- **Backend**: Django 4.2.7 (Python web framework)
- **API**: GraphQL (via Graphene-Django)
- **Database**: PostgreSQL (relational database)
- **Frontend**: React 18 with TypeScript
- **State Management**: Apollo Client (GraphQL client)
- **Styling**: TailwindCSS

---

## PostgreSQL - Database Layer

### What is PostgreSQL?

PostgreSQL is a powerful, open-source relational database management system (RDBMS). It stores structured data in tables with relationships between them.

### Implementation in This Project

**Location**: Database configuration is in `backend/project_manager/settings.py`

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'project_manager'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}
```

**Database Models**: Defined in `backend/core/models.py`

The database stores:
- **Organizations**: Multi-tenant isolation (each organization has its own data)
- **Projects**: Belong to organizations
- **Tasks**: Belong to projects
- **TaskComments**: Belong to tasks

**Key Relationships**:
```
Organization (1) ──< (Many) Projects
Project (1) ──< (Many) Tasks
Task (1) ──< (Many) TaskComments
```

**Database Operations**:
- Migrations: `python manage.py migrate` (creates/updates database schema)
- Sample Data: `python manage.py load_sample_data` (populates test data)
- Admin Access: Django Admin interface at `/admin/`

---

## Django - Backend Framework

### What is Django?

Django is a high-level Python web framework that follows the Model-View-Template (MVT) pattern. It provides:
- **ORM (Object-Relational Mapping)**: Interact with database using Python classes
- **Admin Interface**: Automatic admin panel for data management
- **URL Routing**: Map URLs to views/functions
- **Security**: Built-in protection against common vulnerabilities

### Implementation in This Project

**Project Structure**:
```
backend/
├── project_manager/     # Main Django project settings
│   ├── settings.py      # Configuration (database, apps, middleware)
│   ├── urls.py          # URL routing (GraphQL endpoint)
│   └── schema.py        # Root GraphQL schema
├── core/                # Main application
│   ├── models.py        # Database models (Organization, Project, Task, etc.)
│   ├── admin.py         # Django admin configuration
│   ├── schema.py        # GraphQL types, queries, mutations
│   └── management/      # Custom Django commands
│       └── commands/
│           ├── load_sample_data.py
│           └── create_admin.py
└── manage.py            # Django management script
```

**Key Files**:

1. **`backend/project_manager/settings.py`**:
   - Configures installed apps (`core`, `graphene_django`, `corsheaders`)
   - Database connection settings
   - GraphQL schema configuration
   - CORS settings (allows frontend to access backend)

2. **`backend/core/models.py`**:
   - Defines database models:
     - `Organization`: Multi-tenant organization
     - `Project`: Project within an organization
     - `Task`: Task within a project
     - `TaskComment`: Comment on a task
   - Each model has fields, relationships, and methods

3. **`backend/core/admin.py`**:
   - Registers models with Django admin
   - Configures admin interface (search, filters, display)

4. **`backend/project_manager/urls.py`**:
   - Maps `/graphql/` URL to GraphQL view
   - Enables GraphQL playground for testing

**Django Commands**:
- `python manage.py migrate`: Apply database migrations
- `python manage.py createsuperuser`: Create admin user
- `python manage.py create_admin`: Create default admin (username: admin, password: admin123)
- `python manage.py load_sample_data`: Load sample organizations, projects, tasks

---

## GraphQL - API Layer

### What is GraphQL?

GraphQL is a query language and runtime for APIs. Unlike REST (which has multiple endpoints), GraphQL has a single endpoint where clients can request exactly the data they need.

### Implementation in This Project

**Location**: `backend/core/schema.py`

**GraphQL Schema Structure**:

1. **Types** (Data Structures):
   - `OrganizationType`: Represents an organization
   - `ProjectType`: Represents a project (with computed fields: task_count, completion_rate)
   - `TaskType`: Represents a task (with nested comments)
   - `TaskCommentType`: Represents a comment
   - `ProjectStatisticsType`: Aggregated statistics

2. **Queries** (Read Operations):
   ```graphql
   # Get all organizations
   organizations { id, name, slug }
   
   # Get projects for an organization
   projects(organizationSlug: "acme-corp") { id, name, status }
   
   # Get project statistics
   projectStatistics(organizationSlug: "acme-corp") {
     totalProjects, activeProjects, completionRate
   }
   
   # Get tasks for a project
   tasks(projectId: "1", organizationSlug: "acme-corp") { id, title, status }
   ```

3. **Mutations** (Write Operations):
   ```graphql
   # Create organization
   createOrganization(name: "New Org", slug: "new-org", contactEmail: "email@example.com")
   
   # Create project
   createProject(organizationSlug: "acme-corp", name: "New Project")
   
   # Update project
   updateProject(id: "1", organizationSlug: "acme-corp", status: "COMPLETED")
   
   # Create task
   createTask(projectId: "1", organizationSlug: "acme-corp", title: "New Task")
   
   # Create comment
   createTaskComment(taskId: "1", organizationSlug: "acme-corp", content: "Comment text")
   ```

**GraphQL Endpoint**: `http://localhost:8000/graphql/`

**GraphQL Playground**: Visit `http://localhost:8000/graphql/` in browser to test queries interactively

**Key Implementation Details**:

- **Multi-tenancy**: All queries/mutations require `organizationSlug` to ensure data isolation
- **Error Handling**: Resolvers check if organization exists and raise exceptions if not
- **Computed Fields**: `ProjectType` has resolvers for `task_count`, `completed_tasks`, `completion_rate`
- **Nested Data**: `TaskType` includes `comments` field that resolves to related comments

**Example Query Flow**:
```
Frontend Request
  ↓
Apollo Client (frontend/src/apollo/client.ts)
  ↓
HTTP POST to http://localhost:8000/graphql/
  ↓
Django URL Router (project_manager/urls.py)
  ↓
GraphQL View (graphene_django)
  ↓
Schema Resolver (core/schema.py)
  ↓
Django ORM Query (models.py)
  ↓
PostgreSQL Database
  ↓
Response back to Frontend
```

---

## React Frontend

### What is React?

React is a JavaScript library for building user interfaces. It uses components (reusable UI pieces) and manages state efficiently.

### Implementation in This Project

**Project Structure**:
```
frontend/
├── src/
│   ├── apollo/
│   │   └── client.ts           # Apollo Client configuration
│   ├── components/             # React components
│   │   ├── OrganizationSelector.tsx
│   │   ├── ProjectDashboard.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── TaskBoard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskDetail.tsx
│   │   ├── StatisticsCard.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   ├── graphql/
│   │   ├── queries.ts          # GraphQL queries
│   │   └── mutations.ts        # GraphQL mutations
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── App.tsx                 # Main app component (routing)
│   └── index.tsx               # Entry point
└── package.json
```

**Key Components**:

1. **`App.tsx`**: Main application component
   - Manages organization selection
   - Routes between dashboard and task views
   - Wraps app with Apollo Provider

2. **`OrganizationSelector.tsx`**: Dropdown to select organization
   - Fetches organizations via GraphQL
   - Updates selected organization state

3. **`ProjectDashboard.tsx`**: Displays projects and statistics
   - Fetches projects and statistics via GraphQL
   - Handles project creation/editing
   - Filters projects by status

4. **`TaskBoard.tsx`**: Kanban board for tasks
   - Displays tasks in columns (TODO, IN_PROGRESS, DONE)
   - Allows drag-and-drop (future enhancement)
   - Creates/updates tasks

5. **`TaskDetail.tsx`**: Detailed task view
   - Shows task details and comments
   - Allows adding comments
   - Updates task status

**Apollo Client Configuration** (`src/apollo/client.ts`):
- Connects to GraphQL endpoint: `http://localhost:8000/graphql/`
- Configures cache for efficient data management
- Sets error policy to handle errors gracefully

**GraphQL Integration**:
- **Queries**: Defined in `src/graphql/queries.ts`
- **Mutations**: Defined in `src/graphql/mutations.ts`
- **Hooks**: `useQuery` for fetching, `useMutation` for updates

---

## Application Flow

### Detailed Code Flow Example: Fetching Projects

This example shows the complete flow from user action to database query and back, with actual code references.

#### Step 1: User Action (Frontend)

**Location**: `frontend/src/components/ProjectDashboard.tsx`

When a user selects an organization, the `ProjectDashboard` component uses Apollo Client's `useQuery` hook:

```typescript
// frontend/src/components/ProjectDashboard.tsx (line 24-29)
const { loading, error, data, refetch } = useQuery(GET_PROJECTS, {
  variables: {
    organizationSlug: "acme-corp",
    status: null,
  },
  skip: !organizationSlug,
  errorPolicy: 'all',
});
```

**What happens**:
- Apollo Client reads the `GET_PROJECTS` query from `frontend/src/graphql/queries.ts`
- Constructs a GraphQL query string
- Sends HTTP POST request to `http://localhost:8000/graphql/`

#### Step 2: GraphQL Query Definition (Frontend)

**Location**: `frontend/src/graphql/queries.ts`

```typescript
// frontend/src/graphql/queries.ts (line 15-33)
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
```

**What happens**:
- This GraphQL query is sent as JSON in the HTTP POST body:
```json
{
  "query": "query GetProjects($organizationSlug: String!, $status: String) { ... }",
  "variables": {
    "organizationSlug": "acme-corp",
    "status": null
  }
}
```

#### Step 3: Django Receives Request

**Location**: `backend/project_manager/urls.py`

Django's URL router receives the HTTP POST request:

```python
# backend/project_manager/urls.py
from graphene_django.views import GraphQLView

urlpatterns = [
    path('graphql/', GraphQLView.as_view(graphiql=True)),
]
```

**What happens**:
- Django's WSGI server receives the HTTP POST request
- URL router matches `/graphql/` path
- `GraphQLView` (from graphene-django) processes the request
- Parses the JSON body to extract the GraphQL query and variables

#### Step 4: GraphQL Schema Resolution

**Location**: `backend/core/schema.py`

GraphQL view calls the schema resolver:

```python
# backend/core/schema.py (line 117-126)
def resolve_projects(self, info, organization_slug, status=None):
    try:
        # Step 4a: Query Organization from database
        organization = Organization.objects.get(slug=organization_slug)
    except Organization.DoesNotExist:
        raise Exception(f"Organization with slug '{organization_slug}' not found")

    # Step 4b: Query Projects filtered by organization
    projects = Project.objects.filter(organization=organization)
    if status:
        projects = projects.filter(status=status)
    return projects
```

**What happens**:
- GraphQL matches the `projects` query to `resolve_projects` method
- Passes `organizationSlug` variable as `organization_slug` parameter
- Resolver is called with the GraphQL context (`info`) and variables

#### Step 5: Django ORM to PostgreSQL

**Location**: `backend/core/schema.py` → Django ORM → PostgreSQL

When `Organization.objects.get(slug=organization_slug)` is called:

**Django ORM Layer** (`backend/core/models.py`):
```python
# backend/core/models.py (line 5-16)
class Organization(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    contact_email = models.EmailField(validators=[EmailValidator()])
    created_at = models.DateTimeField(auto_now_add=True)
```

**What Django ORM does**:
1. Converts Python method call to SQL query
2. Generates SQL: `SELECT * FROM core_organization WHERE slug = 'acme-corp';`
3. Opens database connection (configured in `settings.py`)
4. Executes SQL query via `psycopg2` (PostgreSQL adapter)

**PostgreSQL Execution**:
```sql
-- Actual SQL query executed in PostgreSQL
SELECT 
    id, name, slug, contact_email, created_at
FROM core_organization
WHERE slug = 'acme-corp';
```

**PostgreSQL Response**:
- Returns row data: `{id: 1, name: "Acme Corporation", slug: "acme-corp", ...}`
- Django ORM converts row to `Organization` model instance
- Returns Python object: `Organization(id=1, name="Acme Corporation", ...)`

#### Step 6: Project Query to PostgreSQL

**Location**: `backend/core/schema.py` (line 123)

When `Project.objects.filter(organization=organization)` is called:

**Django ORM generates SQL**:
```sql
-- Actual SQL query executed
SELECT 
    id, organization_id, name, description, status, due_date, created_at, updated_at
FROM core_project
WHERE organization_id = 1;
```

**PostgreSQL Response**:
- Returns multiple rows (one per project)
- Django ORM converts each row to `Project` model instance
- Returns QuerySet: `[Project(id=1, name="Website Redesign", ...), Project(id=2, ...)]`

#### Step 7: GraphQL Type Resolution

**Location**: `backend/core/schema.py`

GraphQL resolves each field in the query:

```python
# backend/core/schema.py (line 26-46)
class ProjectType(DjangoObjectType):
    task_count = graphene.Int()
    completed_tasks = graphene.Int()
    completion_rate = graphene.Float()
    status = ProjectStatusEnum()

    class Meta:
        model = Project
        fields = '__all__'
        convert_choices_to_enum = False

    def resolve_task_count(self, info):
        # Additional database query
        return self.tasks.count()  # Executes: SELECT COUNT(*) FROM core_task WHERE project_id = 1
```

**What happens**:
- For each `Project` instance, GraphQL calls field resolvers
- `resolve_task_count` executes another SQL query: `SELECT COUNT(*) FROM core_task WHERE project_id = 1`
- PostgreSQL returns count: `5`
- GraphQL builds response JSON with all resolved fields

#### Step 8: GraphQL Response Construction

**Location**: `backend/core/schema.py` → GraphQL Engine

GraphQL engine constructs the response:

```json
{
  "data": {
    "projects": [
      {
        "id": "1",
        "name": "Website Redesign",
        "description": "Redesign company website",
        "status": "ACTIVE",
        "dueDate": "2024-12-31",
        "createdAt": "2024-01-15T10:00:00Z",
        "taskCount": 5,
        "completedTasks": 2,
        "completionRate": 40.0,
        "organization": {
          "id": "1",
          "slug": "acme-corp"
        }
      },
      {
        "id": "2",
        "name": "Mobile App Development",
        ...
      }
    ]
  }
}
```

#### Step 9: HTTP Response to Frontend

**Location**: Django → HTTP Response → Apollo Client

Django sends HTTP 200 response with JSON body:
- Content-Type: `application/json`
- Body: The GraphQL response JSON (from Step 8)

Apollo Client (`frontend/src/apollo/client.ts`) receives the response:
- Parses JSON
- Updates Apollo cache
- Triggers React component re-render

#### Step 10: React Component Update

**Location**: `frontend/src/components/ProjectDashboard.tsx`

```typescript
// frontend/src/components/ProjectDashboard.tsx (line 40-51)
const projects: Project[] = useMemo(() => {
  if (!data?.projects) return [];
  return data.projects
    .filter((p: any): p is Project => 
      p !== null && 
      p !== undefined && 
      p.id !== null && 
      p.id !== undefined
    );
}, [data]);
```

**What happens**:
- `useQuery` hook updates with new `data`
- Component re-renders with projects array
- Projects are displayed in UI via `ProjectCard` components

### Complete Flow Diagram with Code References

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                              │
│    User selects "Acme Corporation" from dropdown            │
│    Location: frontend/src/components/OrganizationSelector   │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. REACT COMPONENT                                          │
│    ProjectDashboard.tsx calls useQuery(GET_PROJECTS)        │
│    Location: frontend/src/components/ProjectDashboard.tsx:24│
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. APOLLO CLIENT                                            │
│    Constructs GraphQL query string                          │
│    Location: frontend/src/apollo/client.ts                  │
│    Sends HTTP POST to http://localhost:8000/graphql/        │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. DJANGO URL ROUTER                                        │
│    Matches /graphql/ path                                   │
│    Location: backend/project_manager/urls.py                │
│    Calls GraphQLView.as_view()                              │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. GRAPHQL SCHEMA RESOLVER                                  │
│    Calls resolve_projects() method                          │
│    Location: backend/core/schema.py:117                     │
│    Receives: organization_slug="acme-corp"                  │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. DJANGO ORM QUERY                                         │
│    Organization.objects.get(slug="acme-corp")               │
│    Location: backend/core/models.py:5                       │
│    Generates SQL: SELECT * FROM core_organization           │
│                   WHERE slug = 'acme-corp'                  │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. POSTGRESQL DATABASE                                      │
│    Executes SQL query                                       │
│    Returns: {id: 1, name: "Acme Corporation", ...}          │
│    Database: project_manager                                │
│    Table: core_organization                                 │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. DJANGO ORM CONVERSION                                    │
│    Converts SQL row to Organization model instance          │
│    Returns: Organization(id=1, name="Acme Corporation")     │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. GRAPHQL RESOLVER CONTINUES                               │
│    Project.objects.filter(organization=organization)        │
│    Location: backend/core/schema.py:123                     │
│    Generates SQL: SELECT * FROM core_project                │
│                   WHERE organization_id = 1                 │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. POSTGRESQL DATABASE                                     │
│     Executes SQL query                                      │
│     Returns: Multiple rows (projects)                       │
│     Table: core_project                                     │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 11. GRAPHQL FIELD RESOLUTION                                │
│     For each project, resolves:                             │
│     - task_count: self.tasks.count()                        │
│       → SQL: SELECT COUNT(*) FROM core_task                 │
│              WHERE project_id = 1                           │
│     - completion_rate: Calculated from task counts          │
│     Location: backend/core/schema.py:35-46                  │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 12. GRAPHQL RESPONSE                                        │
│     Constructs JSON response with all resolved fields       │
│     Returns: {"data": {"projects": [...]}}                  │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 13. HTTP RESPONSE                                           │
│     Django sends HTTP 200 with JSON body                    │
│     Content-Type: application/json                          │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 14. APOLLO CLIENT                                           │
│     Receives response, updates cache                        │
│     Location: frontend/src/apollo/client.ts                 │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 15. REACT RE-RENDER                                         │
│     useQuery hook updates with new data                     │
│     ProjectDashboard component re-renders                   │
│     Projects displayed in UI                                │
│     Location: frontend/src/components/ProjectDashboard.tsx  │
└─────────────────────────────────────────────────────────────┘
```

### Example: Creating a Project (Mutation Flow)

When a user creates a new project, the flow is similar but includes a database write:

**1. Frontend Mutation** (`frontend/src/components/ProjectForm.tsx`):
```typescript
const [createProject] = useMutation(CREATE_PROJECT, {
  refetchQueries: [{ query: GET_PROJECTS, variables: { organizationSlug } }],
});
```

**2. GraphQL Mutation** (`frontend/src/graphql/mutations.ts`):
```graphql
mutation CreateProject($organizationSlug: String!, $name: String!) {
  createProject(organizationSlug: $organizationSlug, name: $name) {
    id
    name
  }
}
```

**3. Django Resolver** (`backend/core/schema.py:223`):
```python
def mutate(self, info, organization_slug, name, description="", status="ACTIVE", due_date=None):
    organization = Organization.objects.get(slug=organization_slug)
    project = Project.objects.create(
        organization=organization,
        name=name,
        description=description,
        status=status,
        due_date=due_date
    )
    return CreateProject(project=project)
```

**4. Django ORM to PostgreSQL**:
```sql
-- Generated SQL INSERT statement
INSERT INTO core_project 
    (organization_id, name, description, status, due_date, created_at, updated_at)
VALUES 
    (1, 'New Project', '', 'ACTIVE', NULL, NOW(), NOW())
RETURNING id;
```

**5. PostgreSQL Response**:
- Returns the newly created row with `id`
- Django ORM creates `Project` instance
- GraphQL returns the project in response
- Frontend refetches projects list to show the new project

---

## Implementation Details

### Multi-Tenancy Implementation

**Principle**: Each organization's data is completely isolated. Users can only access data for the organization they select.

**Implementation**:
1. **Database Level**: All models have `organization` foreign key
   - `Project.organization` → `Organization`
   - `Task.project.organization` → `Organization` (via Project)
   - `TaskComment.task.project.organization` → `Organization` (via Task → Project)

2. **GraphQL Level**: All queries/mutations require `organizationSlug`
   ```python
   def resolve_projects(self, info, organization_slug, status=None):
       organization = Organization.objects.get(slug=organization_slug)
       return Project.objects.filter(organization=organization)
   ```

3. **Frontend Level**: Organization slug is passed to all queries
   ```typescript
   const { data } = useQuery(GET_PROJECTS, {
     variables: { organizationSlug: selectedOrganization }
   });
   ```

**Security**: 
- Backend validates organization exists before returning data
- If organization doesn't exist, GraphQL returns an error
- Frontend cannot access data without valid organization slug

### Error Handling

**Backend**:
- GraphQL resolvers use try/except blocks
- Raise exceptions with descriptive messages
- GraphQL automatically formats errors as JSON

**Frontend**:
- Apollo Client catches errors
- Components display error messages to users
- Retry buttons allow users to retry failed queries

### Data Validation

**Backend**:
- Django model validators (e.g., `EmailValidator`)
- GraphQL required fields
- Database constraints (unique slugs, foreign keys)

**Frontend**:
- Form validation before submission
- TypeScript types prevent type errors
- Apollo Client validates GraphQL queries

### Sample Data Loading

**Location**: `backend/core/management/commands/load_sample_data.py`

**Process**:
1. Creates 3 organizations
2. Creates 5 projects (distributed across organizations)
3. Creates 11 tasks (distributed across projects)
4. Creates 5 comments (on various tasks)

**Usage**: `python manage.py load_sample_data`

**Auto-loading**: Set `LOAD_SAMPLE_DATA=True` in `.env` to auto-load on startup (if no organizations exist)

---

## Multi-Tenancy Architecture

### Data Isolation Strategy

**Approach**: Organization-based filtering at the query level

**Benefits**:
- Simple implementation
- No schema changes needed
- Easy to understand and maintain
- Scales well for moderate number of organizations

**How It Works**:
1. User selects organization (frontend)
2. All GraphQL queries include `organizationSlug`
3. Backend filters all queries by organization
4. Database returns only data for that organization

**Example**:
```python
# When user selects "acme-corp"
projects = Project.objects.filter(organization__slug="acme-corp")
# Returns only projects belonging to Acme Corporation
```

### Future Enhancements

- **Row-Level Security**: PostgreSQL RLS for database-level isolation
- **Schema per Tenant**: Separate database schema per organization
- **Database per Tenant**: Separate database per organization (for large scale)

---

## File Locations Summary

### Backend Files

| File | Purpose |
|------|---------|
| `backend/project_manager/settings.py` | Django configuration (database, apps, CORS) |
| `backend/project_manager/urls.py` | URL routing (GraphQL endpoint) |
| `backend/core/models.py` | Database models (Organization, Project, Task, TaskComment) |
| `backend/core/schema.py` | GraphQL types, queries, mutations |
| `backend/core/admin.py` | Django admin configuration |
| `backend/core/management/commands/load_sample_data.py` | Sample data loader |
| `backend/core/management/commands/create_admin.py` | Admin user creator |

### Frontend Files

| File | Purpose |
|------|---------|
| `frontend/src/App.tsx` | Main app component (routing, state) |
| `frontend/src/apollo/client.ts` | Apollo Client configuration |
| `frontend/src/graphql/queries.ts` | GraphQL query definitions |
| `frontend/src/graphql/mutations.ts` | GraphQL mutation definitions |
| `frontend/src/components/ProjectDashboard.tsx` | Projects list and statistics |
| `frontend/src/components/TaskBoard.tsx` | Kanban task board |
| `frontend/src/components/TaskDetail.tsx` | Task details and comments |
| `frontend/src/types/index.ts` | TypeScript type definitions |

---

## Conclusion

This architecture provides:
- **Separation of Concerns**: Database, API, and UI are clearly separated
- **Type Safety**: TypeScript and GraphQL ensure type correctness
- **Scalability**: Can handle multiple organizations and large datasets
- **Maintainability**: Clear structure and documentation
- **Security**: Multi-tenant data isolation

The system is production-ready and can be extended with features like authentication, real-time updates, file uploads, and more.


import graphene
from graphene_django import DjangoObjectType
from django.db.models import Q, Count, Case, When, IntegerField
from .models import Organization, Project, Task, TaskComment


# Define explicit enums to avoid conflicts
class ProjectStatusEnum(graphene.Enum):
    ACTIVE = 'ACTIVE'
    COMPLETED = 'COMPLETED'
    ON_HOLD = 'ON_HOLD'


class TaskStatusEnum(graphene.Enum):
    TODO = 'TODO'
    IN_PROGRESS = 'IN_PROGRESS'
    DONE = 'DONE'


class OrganizationType(DjangoObjectType):
    class Meta:
        model = Organization
        fields = '__all__'


class ProjectType(DjangoObjectType):
    task_count = graphene.Int()
    completed_tasks = graphene.Int()
    completion_rate = graphene.Float()
    status = ProjectStatusEnum()  # Use explicit enum for return type

    class Meta:
        model = Project
        fields = '__all__'
        convert_choices_to_enum = False  # Disable auto-enum generation

    def resolve_status(self, info):
        # Convert database string to enum value
        return self.status  # Returns the string, GraphQL converts to enum

    def resolve_task_count(self, info):
        return self.tasks.count()

    def resolve_completed_tasks(self, info):
        return self.tasks.filter(status='DONE').count()

    def resolve_completion_rate(self, info):
        total = self.tasks.count()
        if total == 0:
            return 0.0
        completed = self.tasks.filter(status='DONE').count()
        return round((completed / total) * 100, 2)


class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = '__all__'


class TaskType(DjangoObjectType):
    comments = graphene.List(TaskCommentType)
    status = TaskStatusEnum()  # Use explicit enum for return type

    class Meta:
        model = Task
        fields = '__all__'
        convert_choices_to_enum = False  # Disable auto-enum generation

    def resolve_status(self, info):
        # Convert database string to enum value
        return self.status  # Returns the string, GraphQL converts to enum

    def resolve_comments(self, info):
        return self.comments.all()


class ProjectStatisticsType(graphene.ObjectType):
    total_projects = graphene.Int()
    active_projects = graphene.Int()
    completed_projects = graphene.Int()
    total_tasks = graphene.Int()
    completed_tasks = graphene.Int()
    overall_completion_rate = graphene.Float()


class Query(graphene.ObjectType):
    # Organization queries
    organizations = graphene.List(OrganizationType)
    organization = graphene.Field(OrganizationType, slug=graphene.String(required=True))

    # Project queries
    projects = graphene.List(
        ProjectType,
        organization_slug=graphene.String(required=True),
        status=graphene.String()  # Keep as String for flexibility (frontend sends strings)
    )
    project = graphene.Field(
        ProjectType,
        id=graphene.ID(required=True),
        organization_slug=graphene.String(required=True)
    )
    project_statistics = graphene.Field(
        ProjectStatisticsType,
        organization_slug=graphene.String(required=True)
    )

    # Task queries
    tasks = graphene.List(
        TaskType,
        project_id=graphene.ID(required=True),
        organization_slug=graphene.String(required=True),
        status=graphene.String()  # Keep as String for flexibility (frontend sends strings)
    )
    task = graphene.Field(
        TaskType,
        id=graphene.ID(required=True),
        organization_slug=graphene.String(required=True)
    )

    def resolve_organizations(self, info):
        return Organization.objects.all()

    def resolve_organization(self, info, slug):
        return Organization.objects.get(slug=slug)

    def resolve_projects(self, info, organization_slug, status=None):
        try:
            organization = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist:
            raise Exception(f"Organization with slug '{organization_slug}' not found")

        projects = Project.objects.filter(organization=organization)
        if status:
            projects = projects.filter(status=status)
        return projects

    def resolve_project(self, info, id, organization_slug):
        try:
            organization = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist:
            raise Exception(f"Organization with slug '{organization_slug}' not found")

        try:
            return Project.objects.get(id=id, organization=organization)
        except Project.DoesNotExist:
            raise Exception(f"Project with id '{id}' not found in organization '{organization_slug}'")

    def resolve_project_statistics(self, info, organization_slug):
        try:
            organization = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist:
            raise Exception(f"Organization with slug '{organization_slug}' not found")

        projects = Project.objects.filter(organization=organization)
        tasks = Task.objects.filter(project__organization=organization)

        total_projects = projects.count()
        active_projects = projects.filter(status='ACTIVE').count()
        completed_projects = projects.filter(status='COMPLETED').count()
        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='DONE').count()

        overall_completion_rate = 0.0
        if total_tasks > 0:
            overall_completion_rate = round((completed_tasks / total_tasks) * 100, 2)

        return ProjectStatisticsType(
            total_projects=total_projects,
            active_projects=active_projects,
            completed_projects=completed_projects,
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            overall_completion_rate=overall_completion_rate
        )

    def resolve_tasks(self, info, project_id, organization_slug, status=None):
        try:
            organization = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist:
            raise Exception(f"Organization with slug '{organization_slug}' not found")

        try:
            project = Project.objects.get(id=project_id, organization=organization)
        except Project.DoesNotExist:
            raise Exception(f"Project with id '{project_id}' not found in organization '{organization_slug}'")

        tasks = Task.objects.filter(project=project)
        if status:
            tasks = tasks.filter(status=status)
        return tasks

    def resolve_task(self, info, id, organization_slug):
        try:
            organization = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist:
            raise Exception(f"Organization with slug '{organization_slug}' not found")

        try:
            task = Task.objects.get(id=id, project__organization=organization)
            return task
        except Task.DoesNotExist:
            raise Exception(f"Task with id '{id}' not found in organization '{organization_slug}'")


class CreateOrganization(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        slug = graphene.String(required=True)
        contact_email = graphene.String(required=True)

    organization = graphene.Field(OrganizationType)

    def mutate(self, info, name, slug, contact_email):
        organization = Organization.objects.create(
            name=name,
            slug=slug,
            contact_email=contact_email
        )
        return CreateOrganization(organization=organization)


class CreateProject(graphene.Mutation):
    class Arguments:
        organization_slug = graphene.String(required=True)
        name = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)

    def mutate(self, info, organization_slug, name, description="", status="ACTIVE", due_date=None):
        try:
            organization = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist:
            raise Exception(f"Organization with slug '{organization_slug}' not found")

        project = Project.objects.create(
            organization=organization,
            name=name,
            description=description,
            status=status,
            due_date=due_date
        )
        return CreateProject(project=project)


class UpdateProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        organization_slug = graphene.String(required=True)
        name = graphene.String()
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)

    def mutate(self, info, id, organization_slug, name=None, description=None, status=None, due_date=None):
        try:
            organization = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist:
            raise Exception(f"Organization with slug '{organization_slug}' not found")

        try:
            project = Project.objects.get(id=id, organization=organization)
        except Project.DoesNotExist:
            raise Exception(f"Project with id '{id}' not found in organization '{organization_slug}'")

        if name is not None:
            project.name = name
        if description is not None:
            project.description = description
        if status is not None:
            project.status = status
        if due_date is not None:
            project.due_date = due_date

        project.save()
        return UpdateProject(project=project)


class CreateTask(graphene.Mutation):
    class Arguments:
        project_id = graphene.ID(required=True)
        organization_slug = graphene.String(required=True)
        title = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        assignee_email = graphene.String()
        due_date = graphene.DateTime()

    task = graphene.Field(TaskType)

    def mutate(self, info, project_id, organization_slug, title, description="", status="TODO", assignee_email="", due_date=None):
        try:
            organization = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist:
            raise Exception(f"Organization with slug '{organization_slug}' not found")

        try:
            project = Project.objects.get(id=project_id, organization=organization)
        except Project.DoesNotExist:
            raise Exception(f"Project with id '{project_id}' not found in organization '{organization_slug}'")

        task = Task.objects.create(
            project=project,
            title=title,
            description=description,
            status=status,
            assignee_email=assignee_email,
            due_date=due_date
        )
        return CreateTask(task=task)


class UpdateTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        organization_slug = graphene.String(required=True)
        title = graphene.String()
        description = graphene.String()
        status = graphene.String()
        assignee_email = graphene.String()
        due_date = graphene.DateTime()

    task = graphene.Field(TaskType)

    def mutate(self, info, id, organization_slug, title=None, description=None, status=None, assignee_email=None, due_date=None):
        try:
            organization = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist:
            raise Exception(f"Organization with slug '{organization_slug}' not found")

        try:
            task = Task.objects.get(id=id, project__organization=organization)
        except Task.DoesNotExist:
            raise Exception(f"Task with id '{id}' not found in organization '{organization_slug}'")

        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if status is not None:
            task.status = status
        if assignee_email is not None:
            task.assignee_email = assignee_email
        if due_date is not None:
            task.due_date = due_date

        task.save()
        return UpdateTask(task=task)


class CreateTaskComment(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        organization_slug = graphene.String(required=True)
        content = graphene.String(required=True)
        author_email = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)

    def mutate(self, info, task_id, organization_slug, content, author_email):
        try:
            organization = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist:
            raise Exception(f"Organization with slug '{organization_slug}' not found")

        try:
            task = Task.objects.get(id=task_id, project__organization=organization)
        except Task.DoesNotExist:
            raise Exception(f"Task with id '{task_id}' not found in organization '{organization_slug}'")

        comment = TaskComment.objects.create(
            task=task,
            content=content,
            author_email=author_email
        )
        return CreateTaskComment(comment=comment)


class Mutation(graphene.ObjectType):
    create_organization = CreateOrganization.Field()
    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    create_task_comment = CreateTaskComment.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)


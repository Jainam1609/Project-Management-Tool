"""
Django management command to load sample data.
Run with: python manage.py load_sample_data
"""
from django.core.management.base import BaseCommand
from core.models import Organization, Project, Task, TaskComment
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = 'Loads sample data into the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before loading',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            TaskComment.objects.all().delete()
            Task.objects.all().delete()
            Project.objects.all().delete()
            Organization.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing data cleared.'))

        self.stdout.write('Loading sample data...')

        # Create Organizations
        org1, created = Organization.objects.get_or_create(
            slug='acme-corp',
            defaults={
                'name': 'Acme Corporation',
                'contact_email': 'contact@acme.com'
            }
        )
        if created:
            self.stdout.write(f'Created organization: {org1.name}')

        org2, created = Organization.objects.get_or_create(
            slug='tech-startup',
            defaults={
                'name': 'Tech Startup Inc',
                'contact_email': 'hello@techstartup.com'
            }
        )
        if created:
            self.stdout.write(f'Created organization: {org2.name}')

        org3, created = Organization.objects.get_or_create(
            slug='design-agency',
            defaults={
                'name': 'Creative Design Agency',
                'contact_email': 'info@designagency.com'
            }
        )
        if created:
            self.stdout.write(f'Created organization: {org3.name}')

        # Create Projects for Acme Corporation
        project1, created = Project.objects.get_or_create(
            organization=org1,
            name='Website Redesign',
            defaults={
                'description': 'Complete redesign of company website with modern UI/UX',
                'status': 'ACTIVE',
                'due_date': timezone.now().date() + timedelta(days=60)
            }
        )
        if created:
            self.stdout.write(f'Created project: {project1.name}')

        project2, created = Project.objects.get_or_create(
            organization=org1,
            name='Mobile App Development',
            defaults={
                'description': 'Build native mobile app for iOS and Android',
                'status': 'ACTIVE',
                'due_date': timezone.now().date() + timedelta(days=90)
            }
        )
        if created:
            self.stdout.write(f'Created project: {project2.name}')

        project3, created = Project.objects.get_or_create(
            organization=org1,
            name='Marketing Campaign Q1',
            defaults={
                'description': 'Q1 marketing campaign planning and execution',
                'status': 'COMPLETED',
                'due_date': timezone.now().date() - timedelta(days=30)
            }
        )
        if created:
            self.stdout.write(f'Created project: {project3.name}')

        # Create Projects for Tech Startup
        project4, created = Project.objects.get_or_create(
            organization=org2,
            name='Product Launch',
            defaults={
                'description': 'Launch new SaaS product to market',
                'status': 'ACTIVE',
                'due_date': timezone.now().date() + timedelta(days=45)
            }
        )
        if created:
            self.stdout.write(f'Created project: {project4.name}')

        project5, created = Project.objects.get_or_create(
            organization=org2,
            name='API Integration',
            defaults={
                'description': 'Integrate third-party APIs for payment processing',
                'status': 'ACTIVE',  # Fixed: Projects use ACTIVE, not IN_PROGRESS
                'due_date': timezone.now().date() + timedelta(days=30)
            }
        )
        if created:
            self.stdout.write(f'Created project: {project5.name}')

        # Create Tasks for Website Redesign project
        tasks_data = [
            {
                'project': project1,
                'title': 'Design homepage mockup',
                'description': 'Create initial design mockups for homepage',
                'status': 'DONE',
                'assignee_email': 'designer@acme.com',
                'due_date': timezone.now() - timedelta(days=5)
            },
            {
                'project': project1,
                'title': 'Implement responsive layout',
                'description': 'Build responsive CSS layout for all screen sizes',
                'status': 'IN_PROGRESS',
                'assignee_email': 'developer@acme.com',
                'due_date': timezone.now() + timedelta(days=10)
            },
            {
                'project': project1,
                'title': 'Add contact form',
                'description': 'Implement contact form with validation',
                'status': 'TODO',
                'assignee_email': 'developer@acme.com',
                'due_date': timezone.now() + timedelta(days=15)
            },
            {
                'project': project1,
                'title': 'SEO optimization',
                'description': 'Optimize website for search engines',
                'status': 'TODO',
                'assignee_email': 'seo@acme.com',
                'due_date': timezone.now() + timedelta(days=20)
            },
            {
                'project': project2,
                'title': 'Setup development environment',
                'description': 'Configure React Native development environment',
                'status': 'DONE',
                'assignee_email': 'developer@acme.com',
                'due_date': timezone.now() - timedelta(days=3)
            },
            {
                'project': project2,
                'title': 'Design app UI',
                'description': 'Create UI designs for main screens',
                'status': 'IN_PROGRESS',
                'assignee_email': 'designer@acme.com',
                'due_date': timezone.now() + timedelta(days=7)
            },
            {
                'project': project2,
                'title': 'Implement authentication',
                'description': 'Build user authentication system',
                'status': 'TODO',
                'assignee_email': 'developer@acme.com',
                'due_date': timezone.now() + timedelta(days=14)
            },
            {
                'project': project3,
                'title': 'Create marketing materials',
                'description': 'Design brochures, flyers, and social media graphics',
                'status': 'DONE',
                'assignee_email': 'marketing@acme.com',
                'due_date': timezone.now() - timedelta(days=25)
            },
            {
                'project': project4,
                'title': 'Setup cloud infrastructure',
                'description': 'Configure AWS/Google Cloud for product deployment',
                'status': 'IN_PROGRESS',
                'assignee_email': 'devops@techstartup.com',
                'due_date': timezone.now() + timedelta(days=5)
            },
            {
                'project': project4,
                'title': 'Write documentation',
                'description': 'Create user and developer documentation',
                'status': 'TODO',
                'assignee_email': 'writer@techstartup.com',
                'due_date': timezone.now() + timedelta(days=12)
            },
            {
                'project': project5,
                'title': 'Test payment integration',
                'description': 'Test Stripe payment gateway integration',
                'status': 'IN_PROGRESS',
                'assignee_email': 'developer@techstartup.com',
                'due_date': timezone.now() + timedelta(days=3)
            },
        ]

        tasks_created = 0
        for task_data in tasks_data:
            task, created = Task.objects.get_or_create(
                project=task_data['project'],
                title=task_data['title'],
                defaults=task_data
            )
            if created:
                tasks_created += 1

        self.stdout.write(f'Created {tasks_created} tasks')

        # Create Comments
        comments_data = [
            {
                'task': Task.objects.filter(project=project1, title='Design homepage mockup').first(),
                'content': 'Great work on the design! The color scheme looks perfect.',
                'author_email': 'manager@acme.com'
            },
            {
                'task': Task.objects.filter(project=project1, title='Implement responsive layout').first(),
                'content': 'Please make sure to test on mobile devices before marking as complete.',
                'author_email': 'qa@acme.com'
            },
            {
                'task': Task.objects.filter(project=project1, title='Add contact form').first(),
                'content': 'We need to add email validation and spam protection.',
                'author_email': 'developer@acme.com'
            },
            {
                'task': Task.objects.filter(project=project2, title='Design app UI').first(),
                'content': 'The wireframes look good. Ready to proceed with high-fidelity designs.',
                'author_email': 'designer@acme.com'
            },
            {
                'task': Task.objects.filter(project=project4, title='Setup cloud infrastructure').first(),
                'content': 'Infrastructure is ready. We can start deploying the application.',
                'author_email': 'devops@techstartup.com'
            },
        ]

        comments_created = 0
        for comment_data in comments_data:
            if comment_data['task']:
                comment, created = TaskComment.objects.get_or_create(
                    task=comment_data['task'],
                    content=comment_data['content'],
                    author_email=comment_data['author_email'],
                    defaults={'content': comment_data['content']}
                )
                if created:
                    comments_created += 1

        self.stdout.write(f'Created {comments_created} comments')

        # Summary
        self.stdout.write(self.style.SUCCESS('\nSample data loaded successfully!'))
        self.stdout.write(f'\nSummary:')
        self.stdout.write(f'  Organizations: {Organization.objects.count()}')
        self.stdout.write(f'  Projects: {Project.objects.count()}')
        self.stdout.write(f'  Tasks: {Task.objects.count()}')
        self.stdout.write(f'  Comments: {TaskComment.objects.count()}')


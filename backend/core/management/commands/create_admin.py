"""
Django management command to create admin user.
Run with: python manage.py create_admin
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Creates a default admin user (username: admin, password: admin123)'

    def handle(self, *args, **options):
        if User.objects.filter(username='admin').exists():
            self.stdout.write(self.style.WARNING('Admin user already exists.'))
            return

        User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        self.stdout.write(self.style.SUCCESS('Admin user created successfully!'))
        self.stdout.write('Username: admin')
        self.stdout.write('Password: admin123')


from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Load sample data on startup (only in development)
        import os
        from django.conf import settings
        if settings.DEBUG and os.environ.get('LOAD_SAMPLE_DATA', 'False').lower() == 'true':
            from django.core.management import call_command
            try:
                # Only load if no organizations exist
                if not self.get_model('Organization').objects.exists():
                    call_command('load_sample_data', verbosity=0)
            except Exception:
                pass  # Ignore errors during startup

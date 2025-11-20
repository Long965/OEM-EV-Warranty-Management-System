from django.core.management.base import BaseCommand
from campaigns.rabbitmq_consumer import start_consuming

class Command(BaseCommand):
    help = 'Starts the RabbitMQ consumer to process warranty claim events.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting RabbitMQ Consumer...'))
        start_consuming()
        self.stdout.write(self.style.SUCCESS('RabbitMQ Consumer stopped.'))
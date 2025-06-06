from django.db import models
from django.utils import timezone
from django_ckeditor_5.fields import CKEditor5Field
from django.conf import settings
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

class Subscriber(models.Model):
    """Model for newsletter subscribers"""
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    subscribed_date = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return self.email

    class Meta:
        ordering = ['-subscribed_date']
        verbose_name = 'Subscriber'
        verbose_name_plural = 'Subscribers'
        

class Newsletter(models.Model):
    """Model for creating newsletters"""
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('sent', 'Sent'),
    )
    
    title = models.CharField(max_length=200)
    subject = models.CharField(max_length=200)
    content = CKEditor5Field('Content', config_name='default')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Newsletter'
        verbose_name_plural = 'Newsletters'
    
    def __str__(self):
        return self.title
    
    def send_newsletter(self):
        """Send newsletter to all active subscribers"""
        if self.status == 'sent':
            return False
        
        subscribers = Subscriber.objects.filter(is_active=True)
        
        if not subscribers.exists():
            return False
        
        # Create context for the email template
        context = {
            'newsletter': self,
            'title': self.title,
            'content': self.content,
            'site_name': 'Benard Karanja Portfolio',
            'unsubscribe_url': f"{settings.SITE_URL}/newsletter/unsubscribe/",
        }
        
        # Render email templates
        html_message = render_to_string('newsletter/email/newsletter_template.html', context)
        plain_message = strip_tags(html_message)
        
        # Get default from email
        from_email = settings.DEFAULT_FROM_EMAIL
        
        # Send to all active subscribers
        for subscriber in subscribers:
            msg = EmailMultiAlternatives(
                subject=self.subject,
                body=plain_message,
                from_email=from_email,
                to=[subscriber.email],
            )
            msg.attach_alternative(html_message, "text/html")
            msg.send()
        
        # Update newsletter status
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.save()
        
        return True


class NewsletterTracking(models.Model):
    """Model for tracking newsletter opens and clicks"""
    newsletter = models.ForeignKey(Newsletter, on_delete=models.CASCADE, related_name='tracking')
    subscriber = models.ForeignKey(Subscriber, on_delete=models.CASCADE, related_name='tracking')
    opened = models.BooleanField(default=False)
    opened_at = models.DateTimeField(null=True, blank=True)
    clicked = models.BooleanField(default=False)
    clicked_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('newsletter', 'subscriber')
        verbose_name = 'Newsletter Tracking'
        verbose_name_plural = 'Newsletter Tracking'
        
    def __str__(self):
        return f"{self.subscriber.email} - {self.newsletter.title}"

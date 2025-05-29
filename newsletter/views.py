from django.shortcuts import render, redirect
from django.views.generic import View
from .models import Subscriber, Newsletter
from django.http import JsonResponse, HttpResponse
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.urls import reverse_lazy
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.conf import settings
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

class SubscribeView(View):
    def post(self, request):
        print("🔔 Subscribe view POST method called!")
        email = request.POST.get('email', '')
        name = request.POST.get('name', '')
        
        print(f"🔔 Form data received - Email: {email}, Name: {name}")
        
        # Validate email
        try:
            validate_email(email)
        except ValidationError:
            messages.error(request, "Please enter a valid email address.")
            return redirect(request.META.get('HTTP_REFERER', '/'))
        
        # Create or update subscriber
        subscriber, created = Subscriber.objects.get_or_create(
            email=email,
            defaults={'name': name, 'is_active': True}
        )
        
        # If subscriber exists but was inactive, reactivate
        if not created and not subscriber.is_active:
            print("🔔 Reactivating existing subscriber")
            subscriber.is_active = True
            subscriber.save()
            messages.success(request, "You've been resubscribed to our newsletter!")
            print("🔔 Calling send_welcome_email for resubscribed user")
            self.send_welcome_email(subscriber, resubscribed=True)
        elif created:
            print("🔔 Created new subscriber")
            messages.success(request, "Thank you for subscribing to our newsletter!")
            print("🔔 Calling send_welcome_email for new subscriber")
            self.send_welcome_email(subscriber)
        else:
            print("🔔 User already subscribed")
            messages.info(request, "You're already subscribed to our newsletter.")
        
        # Redirect back to referring page or home
        return redirect(request.META.get('HTTP_REFERER', '/'))
    
    def send_welcome_email(self, subscriber, resubscribed=False):
        """Send a welcome email to new or returning subscribers"""
        print("🔔 send_welcome_email method called!")
        try:
            context = {
                'name': subscriber.name,
                'email': subscriber.email,
                'site_url': settings.SITE_URL,
                'unsubscribe_url': f"{settings.SITE_URL}/newsletter/unsubscribe/",
                'resubscribed': resubscribed,
            }
            
            # Render email templates
            print("🔔 Rendering email templates")
            html_message = render_to_string('newsletter/email/welcome_email.html', context)
            plain_message = strip_tags(html_message)
            
            # Get default from email
            from_email = f"Benard Karanja <{settings.DEFAULT_FROM_EMAIL}>"
            
            # Prepare subject
            subject = "Welcome back to our newsletter!" if resubscribed else "Welcome to our newsletter!"
            
            # Print debug information
            print(f"🔔 Sending email to: {subscriber.email}")
            print(f"🔔 From: {from_email}")
            print(f"🔔 Subject: {subject}")
            
            # Send email with improved headers
            msg = EmailMultiAlternatives(
                subject=subject,
                body=plain_message,
                from_email=from_email,
                to=[subscriber.email],
                headers={
                    'List-Unsubscribe': f"{settings.SITE_URL}/newsletter/unsubscribe/?email={subscriber.email}",
                    'X-Entity-Ref-ID': f"newsletter-welcome-{subscriber.id}",  # Unique ID to avoid spam flagging
                    'Precedence': 'bulk'
                }
            )
            msg.attach_alternative(html_message, "text/html")
            
            # Explicit send with exception capture
            try:
                print("🔔 Attempting to send email...")
                send_result = msg.send()
                print(f"🔔 Email send result: {send_result}")
            except Exception as send_error:
                print(f"🔔 ERROR SENDING EMAIL: {send_error}")
                print(f"🔔 Error type: {type(send_error)}")
                import traceback
                print(f"🔔 Traceback: {traceback.format_exc()}")
                
            print("🔔 Email sent successfully!")
            return True
        except Exception as e:
            print(f"🔔 ERROR in send_welcome_email: {e}")
            print(f"🔔 Error type: {type(e)}")
            import traceback
            print(f"🔔 Traceback: {traceback.format_exc()}")
            # Continue execution even if email fails
            return False


class UnsubscribeView(View):
    def get(self, request):
        return render(request, 'newsletter/unsubscribe.html')
    
    def post(self, request):
        email = request.POST.get('email', '')
        
        try:
            subscriber = Subscriber.objects.get(email=email)
            subscriber.is_active = False
            subscriber.save()
            messages.success(request, "You've been successfully unsubscribed from our newsletter.")
        except Subscriber.DoesNotExist:
            messages.error(request, "Email address not found in our subscriber list.")
        
        return redirect('newsletter:unsubscribe_success')


class UnsubscribeSuccessView(View):
    def get(self, request):
        return render(request, 'newsletter/unsubscribe_success.html')


@method_decorator(csrf_exempt, name='dispatch')
class TrackOpenView(View):
    """Track when a subscriber opens a newsletter email"""
    def get(self, request, tracking_id):
        try:
            parts = tracking_id.split('-')
            if len(parts) == 2:
                newsletter_id, subscriber_id = parts
                from .models import NewsletterTracking
                
                tracking, created = NewsletterTracking.objects.get_or_create(
                    newsletter_id=newsletter_id,
                    subscriber_id=subscriber_id,
                    defaults={'opened': True, 'opened_at': timezone.now()}
                )
                
                if not created and not tracking.opened:
                    tracking.opened = True
                    tracking.opened_at = timezone.now()
                    tracking.save()
                
                # Return a transparent 1x1 pixel GIF
                pixel = b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
                return HttpResponse(pixel, content_type='image/gif')
        except Exception as e:
            print(f"Error tracking open: {e}")
        
        # Return a transparent 1x1 pixel GIF even on error
        pixel = b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
        return HttpResponse(pixel, content_type='image/gif')


@method_decorator(csrf_exempt, name='dispatch')
class TrackClickView(View):
    """Track when a subscriber clicks a link in a newsletter email"""
    def get(self, request, tracking_id):
        try:
            parts = tracking_id.split('-')
            if len(parts) == 2:
                newsletter_id, subscriber_id = parts
                redirect_url = request.GET.get('url', '/')
                
                from .models import NewsletterTracking
                
                tracking, created = NewsletterTracking.objects.get_or_create(
                    newsletter_id=newsletter_id,
                    subscriber_id=subscriber_id,
                    defaults={'clicked': True, 'clicked_at': timezone.now()}
                )
                
                if not created and not tracking.clicked:
                    tracking.clicked = True
                    tracking.clicked_at = timezone.now()
                    tracking.save()
                
                return redirect(redirect_url)
        except Exception as e:
            print(f"Error tracking click: {e}")
        
        # Redirect to home on error
        return redirect('/')

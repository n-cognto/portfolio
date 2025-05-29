from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib import messages
from .models import Project, Skill, Certificate, Contact
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.conf import settings
import json

def home(request):
    """
    View function for homepage of the portfolio site
    """
    # Get data from the database
    projects = Project.objects.all()
    skills = Skill.objects.all()
    certificates = Certificate.objects.all()
    
    # Prepare context for the template
    context = {
        'projects': projects,
        'skills': skills,
        'certificates': certificates,
    }
    
    return render(request, 'main/index.html', context)

@csrf_exempt
def contact_form(request):
    """
    Handle contact form submissions via AJAX and send email notification
    """
    if request.method == 'POST':
        try:
            # For AJAX requests
            if request.headers.get('Content-Type') == 'application/json':
                data = json.loads(request.body)
                name = data.get('name', '')
                email = data.get('email', '')
                message = data.get('message', '')
            else:
                # For regular form submissions
                name = request.POST.get('name', '')
                email = request.POST.get('email', '')
                message = request.POST.get('message', '')
            
            # Validate the data
            if not all([name, email, message]):
                return JsonResponse({'success': False, 'error': 'All fields are required'}, status=400)
            
            # Create a new contact entry
            Contact.objects.create(
                name=name,
                email=email,
                message=message
            )
            
            # Send email notification
            subject = f"New Contact Form Submission from {name}"
            email_message = f"""
You have received a new message from your portfolio website contact form.

Name: {name}
Email: {email}
Message:
{message}

This email was sent from your portfolio contact form.
            """
            
            recipient_email = settings.EMAIL_HOST_USER  # Or you can specify another email address
            
            # Send the email
            send_mail(
                subject=subject,
                message=email_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False,
            )
            
            if request.headers.get('Content-Type') == 'application/json':
                return JsonResponse({'success': True, 'message': 'Message sent successfully!'})
            else:
                messages.success(request, 'Message sent successfully!')
                return redirect('main:home')
                
        except Exception as e:
            if request.headers.get('Content-Type') == 'application/json':
                return JsonResponse({'success': False, 'error': str(e)}, status=500)
            else:
                messages.error(request, f'An error occurred: {str(e)}')
                return redirect('main:home')
    
    # For non-POST requests
    return JsonResponse({'success': False, 'error': 'Only POST requests are allowed'}, status=405)

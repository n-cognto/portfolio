#!/usr/bin/env python
import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio.settings')
django.setup()

from main.models import Certificate

def fix_certificate_paths():
    """
    Fix the image paths in Certificate model by removing duplicate 'media/' prefixes
    """
    print("Starting certificate image path fix...")
    certificates = Certificate.objects.all()
    
    for cert in certificates:
        print(f"Processing: {cert.name} - Current image path: {cert.image}")
        
        # Fix paths that contain 'media/media/'
        if cert.image and str(cert.image).startswith('media/'):
            # Remove 'media/' prefix to get just the filename
            filename = str(cert.image).replace('media/', '', 1)
            
            print(f"  - Updating image path from '{cert.image}' to '{filename}'")
            cert.image = filename
            cert.save()
        
    print("Certificate path correction completed!")

if __name__ == '__main__':
    fix_certificate_paths()
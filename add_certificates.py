#!/usr/bin/env python
import os
import sys
import datetime
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio.settings')
django.setup()

from main.models import Certificate

# Clear existing certificates if needed
# Certificate.objects.all().delete()

# Certificate data from your JavaScript
certificates_data = [
    {
        "title": "Virtual Assistant",
        "platform": "ALX Africa",
        "date": "2024-09-01",  # Format as YYYY-MM-DD
        "logo": "media/alx-logo.png",
        "link": ""
    },
    {
        "title": "IBM Cyber Security Fundamentals",
        "platform": "IBM",
        "date": "2024-11-01",
        "logo": "media/ibm-logo.jpeg",
        "link": "https://www.credly.com/badges/f5dfe17d-fa3c-48e6-b078-64673e19e06f/linked_in?t=smy6uv"
    },
    {
        "title": "Introduction to Exploits",
        "platform": "Udemy",
        "date": "2024-02-15",
        "logo": "media/udemy-logo.jpeg",
        "link": "https://drive.google.com/file/d/151bCSGRgKV_H3iOpW0AznjYVf-81KTgt/view?usp=drive_link"
    },
    {
        "title": "Python for Everybody",
        "platform": "Try Kibo School",
        "date": "2024-03-15",
        "logo": "media/python-logo.jpeg",
        "link": ""
    },
    {
        "title": "Artificial Intelligence",
        "platform": "IBM SkillBuild",
        "date": "2024-06-15",
        "logo": "media/ibm-logo.jpeg",
        "link": "https://www.credly.com/earner/earned/badge/23be8694-6541-457f-a02f-28e91358bfea"
    },
    {
        "title": "Our Future with AI",
        "platform": "ALX Africa",
        "date": "2024-06-20",
        "logo": "media/alx-logo.png",
        "link": "https://drive.google.com/file/d/1HC1PRgQoEXt5lsJBq8oPxPj5dThwOMhe/view?usp=drive_link"
    },
    {
        "title": "Python Basics",
        "platform": "Hackerrank",
        "date": "2024-03-10",
        "logo": "media/python-logo.jpeg",
        "link": "https://drive.google.com/file/d/1IWAJQoSBuqPqQG0RZYZERIjor3pSzk8s/view?usp=drive_link"
    },
    {
        "title": "Cisco CyberShujaa Ethical Hacking",
        "platform": "Cisco",
        "date": "2024-12-15",
        "logo": "media/cyber-shujaa.jpeg",
        "link": "https://www.credly.com/badges/ad9cca44-6a8d-4658-8dac-6d800b0e3170/public_url"
    },
    {
        "title": "Web Development, Software Engineering, Database Administration & Python Programming",
        "platform": "Power Learn Project",
        "date": "2024-12-20",
        "logo": "media/power-learn.jpeg",
        "link": "https://drive.google.com/file/d/1LF84BkzE0_PFTrdzFbWgLy_ZuOv7G2NT/view?usp=drive_link"
    },
    {
        "title": "Information Technology Fundamentals",
        "platform": "IBM SkillBuild",
        "date": "2024-12-01",
        "logo": "media/ibm-logo.jpeg",
        "link": "https://www.credly.com/badges/3f0e2914-f90d-461a-bb01-e80b03b3499d/public_url"
    },
    {
        "title": "Emerging Tech",
        "platform": "IBM SkillBuild",
        "date": "2024-12-10",
        "logo": "media/ibm-logo.jpeg",
        "link": "https://www.credly.com/badges/44131d76-1d84-44a1-b3b4-7a5dd009358b/public_url"
    },
    {
        "title": "Advent of Cyber 2024",
        "platform": "TryHackMe",
        "date": "2024-12-25",
        "logo": "media/tryhackme.jpeg",
        "link": "https://tryhackme-certificates.s3-eu-west-1.amazonaws.com/THM-SKFNHTF5K6.pdf"
    },
    {
        "title": "IBM Cyber-Security with Capstone",
        "platform": "IBM",
        "date": "2025-04-15",
        "logo": "media/ibm-logo.jpeg",
        "link": "https://www.credly.com/badges/f5dfe17d-fa3c-48e6-b078-64673e19e06f/linked_in?t=smy6uv"
    },
]

# Add the certificates to the database
for cert in certificates_data:
    # Check if certificate already exists to avoid duplicates
    existing = Certificate.objects.filter(name=cert["title"], issuing_organization=cert["platform"])
    
    if not existing.exists():
        print(f"Adding: {cert['title']} - {cert['platform']}")
        
        # Create certificate
        Certificate.objects.create(
            name=cert["title"],
            issuing_organization=cert["platform"],
            issue_date=cert["date"],
            description=f"Certificate issued by {cert['platform']}",
            # We're not actually uploading files here, just storing the path
            image=cert["logo"] if cert["logo"] else None,
            url=cert["link"] if cert["link"] else None
        )
    else:
        print(f"Already exists: {cert['title']} - {cert['platform']}")

print("Certificate data import completed!")
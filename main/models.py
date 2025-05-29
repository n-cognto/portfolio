from django.db import models

# Create your models here.

class Project(models.Model):
    """Model representing a portfolio project"""
    CATEGORY_CHOICES = (
        ('web', 'Web Development'),
        ('cybersecurity', 'Cybersecurity'),
        ('desktop', 'Desktop Apps'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='projects/', blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    technologies = models.CharField(max_length=500)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='web')
    created_date = models.DateField()
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_date']

class Skill(models.Model):
    """Model representing a skill or technology"""
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['category', 'name']

class Certificate(models.Model):
    """Model representing a certificate or qualification"""
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    issue_date = models.DateField()
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='certificates/', blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.name} - {self.issuing_organization}"
    
    class Meta:
        ordering = ['-issue_date']

class Contact(models.Model):
    """Model representing a contact form submission"""
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Message from {self.name} - {self.created_at.strftime('%Y-%m-%d')}"
    
    class Meta:
        ordering = ['-created_at']

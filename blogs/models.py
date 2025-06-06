from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
import math
import re
from datetime import datetime, timedelta

# Create your models here.

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    description = models.TextField(blank=True, help_text='Tag description for SEO')
    color = models.CharField(max_length=7, default='#6366f1', help_text='Hex color code for tag styling')
    created = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse('blogs:tag_detail', args=[self.slug])

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#3498db', help_text='Hex color code')
    
    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return reverse('blogs:category_detail', args=[self.slug])
    
    def post_count(self):
        return self.posts.filter(status='published').count()

class Post(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('scheduled', 'Scheduled'),
    )
    
    DIFFICULTY_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )
    
    title = models.CharField(max_length=250)
    slug = models.SlugField(max_length=250, unique_for_date='publish')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='posts')
    tags = models.ManyToManyField(Tag, blank=True, related_name='posts')
    content = models.TextField()
    excerpt = models.TextField(max_length=300, blank=True, help_text='Brief description of the post')
    featured_image = models.ImageField(upload_to='blog/%Y/%m/%d/', blank=True, null=True)
    
    # Enhanced content fields
    difficulty_level = models.CharField(max_length=12, choices=DIFFICULTY_CHOICES, default='intermediate')
    estimated_read_time = models.PositiveIntegerField(blank=True, null=True, help_text='Reading time in minutes')
    table_of_contents = models.TextField(blank=True, help_text='JSON structure for TOC')
    
    # SEO fields
    meta_title = models.CharField(max_length=60, blank=True, help_text='SEO title (60 chars max)')
    meta_description = models.CharField(max_length=160, blank=True, help_text='SEO description (160 chars max)')
    meta_keywords = models.CharField(max_length=255, blank=True, help_text='Comma-separated keywords')
    
    # Engagement fields
    views = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    shares = models.PositiveIntegerField(default=0)
    read_percentage = models.FloatField(default=0.0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Social media
    allow_comments = models.BooleanField(default=True)
    enable_social_sharing = models.BooleanField(default=True)
    
    # Dates
    publish = models.DateTimeField(default=timezone.now)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    
    # Featured post
    is_featured = models.BooleanField(default=False)
    is_trending = models.BooleanField(default=False)
    featured_until = models.DateTimeField(blank=True, null=True, help_text='Auto-unfeature after this date')
    
    class Meta:
        ordering = ('-publish',)
        indexes = [
            models.Index(fields=['status', 'publish']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['is_featured', 'status']),
        ]
        
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('blogs:post_detail', args=[self.publish.year,
                                                 self.publish.month,
                                                 self.publish.day,
                                                 self.slug])
    
    def save(self, *args, **kwargs):
        # Auto-generate excerpt if not provided
        if not self.excerpt and self.content:
            plain_text = re.sub(r'<[^>]+>', '', self.content)
            self.excerpt = plain_text[:200] + '...' if len(plain_text) > 200 else plain_text
        
        # Auto-calculate reading time
        if not self.estimated_read_time:
            word_count = len(self.content.split())
            self.estimated_read_time = max(1, math.ceil(word_count / 200))
        
        # Auto-generate meta fields if not provided
        if not self.meta_title:
            self.meta_title = self.title[:60]
        if not self.meta_description:
            self.meta_description = self.excerpt[:160] if self.excerpt else self.title
        
        # Auto-unfeature if past featured_until date
        if self.featured_until and timezone.now() > self.featured_until:
            self.is_featured = False
            
        super().save(*args, **kwargs)
    
    def reading_time(self):
        """Calculate estimated reading time in minutes"""
        return self.estimated_read_time or max(1, math.ceil(len(self.content.split()) / 200))
    
    def increment_views(self):
        """Increment view count"""
        self.views += 1
        self.save(update_fields=['views'])
    
    def increment_shares(self):
        """Increment share count"""
        self.shares += 1
        self.save(update_fields=['shares'])
    
    def get_related_posts(self, limit=3):
        """Get related posts based on tags and category"""
        related = Post.objects.filter(
            status='published'
        ).exclude(id=self.id)
        
        # First try to get posts with same tags
        if self.tags.exists():
            related = related.filter(tags__in=self.tags.all()).distinct()
        
        # If not enough posts, include posts from same category
        if related.count() < limit:
            category_posts = Post.objects.filter(
                category=self.category,
                status='published'
            ).exclude(id=self.id)
            related = related.union(category_posts)
        
        return related.order_by('-publish')[:limit]
    
    def is_new(self):
        """Check if post is newer than 7 days"""
        return timezone.now() - self.publish < timedelta(days=7)
    
    def get_social_share_urls(self):
        """Generate social media sharing URLs"""
        full_url = f"https://your-domain.com{self.get_absolute_url()}"
        return {
            'twitter': f"https://twitter.com/intent/tweet?url={full_url}&text={self.title}",
            'facebook': f"https://www.facebook.com/sharer/sharer.php?u={full_url}",
            'linkedin': f"https://www.linkedin.com/sharing/share-offsite/?url={full_url}",
            'whatsapp': f"https://wa.me/?text={self.title} {full_url}",
        }

# New model for post series
class PostSeries(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    posts = models.ManyToManyField(Post, through='PostSeriesOrder', related_name='series')
    created = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Post Series'
    
    def __str__(self):
        return self.title

class PostSeriesOrder(models.Model):
    series = models.ForeignKey(PostSeries, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    order = models.PositiveIntegerField()
    
    class Meta:
        unique_together = ('series', 'post')
        ordering = ['order']

# Enhanced Comment model
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='replies')
    name = models.CharField(max_length=80)
    email = models.EmailField()
    website = models.URLField(blank=True)
    body = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ('created',)
        
    def __str__(self):
        return f'Comment by {self.name} on {self.post}'
    
    def is_reply(self):
        return self.parent is not None
    
    def get_replies(self):
        """Get all replies to this comment"""
        return Comment.objects.filter(parent=self, active=True).order_by('created')
    
    def reply_count(self):
        """Get count of replies"""
        return self.get_replies().count()

# New model for bookmarks/favorites
class PostBookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'post')

# New model for reading progress
class ReadingProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    progress_percentage = models.FloatField(default=0.0)
    last_read = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'post')

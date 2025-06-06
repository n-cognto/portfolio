from django.shortcuts import render, get_object_or_404, redirect
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Post, Category, Comment, Tag, PostBookmark, ReadingProgress, PostSeries
from django.http import HttpResponseRedirect, JsonResponse, Http404
from django.urls import reverse
from django.contrib import messages
from django.db.models import Q, Count, Avg, F
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.views.generic import ListView, DetailView
from django.utils import timezone
import json
from datetime import datetime, timedelta

def post_list(request, category_slug=None, tag_slug=None):
    category = None
    tag = None
    categories = Category.objects.annotate(post_count=Count('posts')).filter(post_count__gt=0)
    tags = Tag.objects.annotate(post_count=Count('posts')).filter(post_count__gt=0)[:20]
    posts = Post.objects.filter(status='published').select_related('author', 'category').prefetch_related('tags')
    
    # Search functionality
    search_query = request.GET.get('search', '')
    if search_query:
        posts = posts.filter(
            Q(title__icontains=search_query) |
            Q(content__icontains=search_query) |
            Q(excerpt__icontains=search_query) |
            Q(tags__name__icontains=search_query) |
            Q(category__name__icontains=search_query)
        ).distinct()
    
    # Filter by difficulty
    difficulty = request.GET.get('difficulty')
    if difficulty and difficulty in ['beginner', 'intermediate', 'advanced']:
        posts = posts.filter(difficulty_level=difficulty)
    
    # Sort options
    sort_by = request.GET.get('sort', 'latest')
    if sort_by == 'popular':
        posts = posts.order_by('-views', '-publish')
    elif sort_by == 'trending':
        posts = posts.filter(is_trending=True).order_by('-publish')
    elif sort_by == 'oldest':
        posts = posts.order_by('publish')
    else:  # latest (default)
        posts = posts.order_by('-publish')
    
    # Filter by category
    if category_slug:
        category = get_object_or_404(Category, slug=category_slug)
        posts = posts.filter(category=category)
    
    # Filter by tag
    if tag_slug:
        tag = get_object_or_404(Tag, slug=tag_slug)
        posts = posts.filter(tags=tag)
    
    # Get featured posts for homepage
    featured_posts = Post.objects.filter(
        status='published', 
        is_featured=True
    ).select_related('author', 'category').order_by('-publish')[:3]
    
    # Get trending posts
    trending_posts = Post.objects.filter(
        status='published', 
        is_trending=True
    ).select_related('author', 'category').order_by('-publish')[:5]
    
    # Get popular posts (by views)
    popular_posts = Post.objects.filter(
        status='published'
    ).select_related('author', 'category').order_by('-views')[:5]
    
    # Get recent posts
    recent_posts = Post.objects.filter(
        status='published'
    ).select_related('author', 'category').order_by('-publish')[:5]
    
    # Archive dates
    archive_dates = Post.objects.filter(status='published').dates('publish', 'month', order='DESC')[:12]
    
    # Pagination with responsive page size
    page_size = 9 if not search_query else 12
    paginator = Paginator(posts, page_size)
    page = request.GET.get('page')
    
    try:
        posts = paginator.page(page)
    except PageNotAnInteger:
        posts = paginator.page(1)
    except EmptyPage:
        posts = paginator.page(paginator.num_pages)
    
    # Check if this is an AJAX request for infinite scroll
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render(request, 'blogs/post/list_ajax.html', {'posts': posts})
    
    context = {
        'category': category,
        'tag': tag,
        'categories': categories,
        'tags': tags,
        'posts': posts,
        'featured_posts': featured_posts,
        'trending_posts': trending_posts,
        'popular_posts': popular_posts,
        'recent_posts': recent_posts,
        'archive_dates': archive_dates,
        'search_query': search_query,
        'difficulty': difficulty,
        'sort_by': sort_by,
        'page': page,
    }
    
    return render(request, 'blogs/post/list.html', context)

def post_detail(request, year, month, day, post):
    post = get_object_or_404(Post, 
                            slug=post,
                            status='published',
                            publish__year=year,
                            publish__month=month,
                            publish__day=day)
    
    # Increment view count (only once per session)
    session_key = f'viewed_post_{post.id}'
    if not request.session.get(session_key):
        post.increment_views()
        request.session[session_key] = True
    
    # Check if user has bookmarked this post
    is_bookmarked = False
    user_progress = None
    if request.user.is_authenticated:
        is_bookmarked = PostBookmark.objects.filter(user=request.user, post=post).exists()
        user_progress = ReadingProgress.objects.filter(user=request.user, post=post).first()
    
    # List of active comments for this post (only parent comments)
    comments = post.comments.filter(active=True, parent__isnull=True).select_related('post').order_by('-created')
    
    # Get related posts using the model method
    related_posts = post.get_related_posts()
    
    # Get previous and next posts
    previous_post = Post.objects.filter(
        status='published',
        publish__lt=post.publish
    ).select_related('category').order_by('-publish').first()
    
    next_post = Post.objects.filter(
        status='published',
        publish__gt=post.publish
    ).select_related('category').order_by('publish').first()
    
    # Get popular posts for sidebar
    popular_posts = Post.objects.filter(
        status='published'
    ).select_related('author', 'category').order_by('-views')[:5]
    
    # Get recent posts for sidebar
    recent_posts = Post.objects.filter(
        status='published'
    ).exclude(id=post.id).select_related('author', 'category').order_by('-publish')[:5]
    
    # Get post series if this post belongs to any
    post_series = PostSeries.objects.filter(posts=post).first()
    series_posts = []
    if post_series:
        series_posts = post_series.posts.filter(status='published').order_by('postseriesorder__order')
    
    context = {
        'post': post,
        'comments': comments,
        'related_posts': related_posts,
        'previous_post': previous_post,
        'next_post': next_post,
        'popular_posts': popular_posts,
        'recent_posts': recent_posts,
        'is_bookmarked': is_bookmarked,
        'user_progress': user_progress,
        'post_series': post_series,
        'series_posts': series_posts,
    }
    
    return render(request, 'blogs/post/detail.html', context)

def add_comment(request, post_id):
    post = get_object_or_404(Post, id=post_id, status='published')
    
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        website = request.POST.get('website', '')
        body = request.POST.get('body')
        parent_id = request.POST.get('parent_id')
        
        # Basic validation
        if not name or not email or not body:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'error': 'All fields are required'})
            messages.error(request, 'Please fill in all required fields.')
            return HttpResponseRedirect(post.get_absolute_url() + '#comments')
        
        parent = None
        if parent_id:
            try:
                parent = Comment.objects.get(id=parent_id, post=post, active=True)
            except Comment.DoesNotExist:
                parent = None
        
        comment = Comment.objects.create(
            post=post,
            parent=parent,
            name=name,
            email=email,
            website=website,
            body=body,
            active=True  # Auto-approve comments for simplicity
        )
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            # AJAX request - return JSON response
            return JsonResponse({
                'success': True,
                'comment_id': comment.id,
                'name': comment.name,
                'body': comment.body,
                'created': comment.created.strftime('%B %d, %Y at %I:%M %p'),
                'is_reply': comment.is_reply(),
                'website': comment.website
            })
        else:
            messages.success(request, 'Your comment has been added!')
            return HttpResponseRedirect(post.get_absolute_url() + '#comments')
    
    return HttpResponseRedirect(post.get_absolute_url())

@require_POST
@csrf_exempt
def like_post(request, post_id):
    """AJAX endpoint to like a post"""
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            post = get_object_or_404(Post, id=post_id, status='published')
            
            # Prevent multiple likes from same session
            session_key = f'liked_post_{post.id}'
            if request.session.get(session_key):
                return JsonResponse({
                    'success': False,
                    'error': 'You have already liked this post'
                })
            
            post.likes += 1
            post.save(update_fields=['likes'])
            request.session[session_key] = True
            
            return JsonResponse({
                'success': True,
                'likes': post.likes
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@require_POST
@csrf_exempt
def share_post(request, post_id):
    """AJAX endpoint to track post shares"""
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            post = get_object_or_404(Post, id=post_id, status='published')
            post.increment_shares()
            
            return JsonResponse({
                'success': True,
                'shares': post.shares
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@login_required
@require_POST
def bookmark_post(request, post_id):
    """Toggle bookmark for a post"""
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            post = get_object_or_404(Post, id=post_id, status='published')
            bookmark, created = PostBookmark.objects.get_or_create(
                user=request.user,
                post=post
            )
            
            if not created:
                bookmark.delete()
                bookmarked = False
            else:
                bookmarked = True
            
            return JsonResponse({
                'success': True,
                'bookmarked': bookmarked
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@login_required
@require_POST
def update_reading_progress(request, post_id):
    """Update reading progress for a post"""
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            post = get_object_or_404(Post, id=post_id, status='published')
            progress = float(request.POST.get('progress', 0))
            
            reading_progress, created = ReadingProgress.objects.get_or_create(
                user=request.user,
                post=post,
                defaults={'progress_percentage': progress}
            )
            
            if not created:
                reading_progress.progress_percentage = progress
                reading_progress.save()
            
            return JsonResponse({
                'success': True,
                'progress': progress
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})

def archive_list(request, year, month=None):
    """Show posts for a specific month/year"""
    posts = Post.objects.filter(
        status='published',
        publish__year=year
    ).select_related('author', 'category').prefetch_related('tags')
    
    if month:
        posts = posts.filter(publish__month=month)
        archive_date = datetime(year, month, 1)
        title = archive_date.strftime('%B %Y')
    else:
        title = str(year)
    
    # Pagination
    paginator = Paginator(posts, 10)
    page = request.GET.get('page')
    
    try:
        posts = paginator.page(page)
    except PageNotAnInteger:
        posts = paginator.page(1)
    except EmptyPage:
        posts = paginator.page(paginator.num_pages)
    
    context = {
        'posts': posts,
        'archive_title': title,
        'year': year,
        'month': month,
    }
    
    return render(request, 'blogs/post/archive.html', context)

def tag_detail(request, tag_slug):
    """Show posts for a specific tag"""
    tag = get_object_or_404(Tag, slug=tag_slug)
    posts = Post.objects.filter(
        tags=tag,
        status='published'
    ).select_related('author', 'category').order_by('-publish')
    
    # Pagination
    paginator = Paginator(posts, 12)
    page = request.GET.get('page')
    
    try:
        posts = paginator.page(page)
    except PageNotAnInteger:
        posts = paginator.page(1)
    except EmptyPage:
        posts = paginator.page(paginator.num_pages)
    
    context = {
        'tag': tag,
        'posts': posts,
    }
    
    return render(request, 'blogs/tag/detail.html', context)

@login_required
def bookmarks_list(request):
    """Show user's bookmarked posts"""
    bookmarks = PostBookmark.objects.filter(
        user=request.user
    ).select_related('post__author', 'post__category').order_by('-created')
    
    # Pagination
    paginator = Paginator(bookmarks, 10)
    page = request.GET.get('page')
    
    try:
        bookmarks = paginator.page(page)
    except PageNotAnInteger:
        bookmarks = paginator.page(1)
    except EmptyPage:
        bookmarks = paginator.page(paginator.num_pages)
    
    context = {
        'bookmarks': bookmarks,
    }
    
    return render(request, 'blogs/bookmarks.html', context)

def search_suggestions(request):
    """AJAX endpoint for search suggestions"""
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        query = request.GET.get('q', '').strip()
        if len(query) >= 2:
            posts = Post.objects.filter(
                Q(title__icontains=query) | Q(excerpt__icontains=query),
                status='published'
            ).values('title', 'slug', 'publish')[:5]
            
            suggestions = []
            for post in posts:
                suggestions.append({
                    'title': post['title'],
                    'url': reverse('blogs:post_detail', args=[
                        post['publish'].year,
                        post['publish'].month,
                        post['publish'].day,
                        post['slug']
                    ])
                })
            
            return JsonResponse({'suggestions': suggestions})
    
    return JsonResponse({'suggestions': []})

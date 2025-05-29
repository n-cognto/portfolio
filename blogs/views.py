from django.shortcuts import render, get_object_or_404, redirect
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Post, Category, Comment
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib import messages

def post_list(request, category_slug=None):
    category = None
    categories = Category.objects.all()
    posts = Post.objects.filter(status='published')
    
    if category_slug:
        category = get_object_or_404(Category, slug=category_slug)
        posts = posts.filter(category=category)
    
    # Pagination with 5 posts per page
    paginator = Paginator(posts, 5)
    page = request.GET.get('page')
    
    try:
        posts = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer deliver the first page
        posts = paginator.page(1)
    except EmptyPage:
        # If page is out of range deliver last page of results
        posts = paginator.page(paginator.num_pages)
    
    return render(request, 'blogs/post/list.html', {
        'category': category,
        'categories': categories,
        'posts': posts,
        'page': page,
    })

def post_detail(request, year, month, day, post):
    post = get_object_or_404(Post, 
                            slug=post,
                            status='published',
                            publish__year=year,
                            publish__month=month,
                            publish__day=day)
    
    # List of active comments for this post
    comments = post.comments.filter(active=True)
    
    # Get related posts
    related_posts = Post.objects.filter(category=post.category, status='published').exclude(id=post.id)[:3]
    
    return render(request, 'blogs/post/detail.html', {
        'post': post,
        'comments': comments,
        'related_posts': related_posts,
    })

def add_comment(request, post_id):
    post = get_object_or_404(Post, id=post_id, status='published')
    
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        body = request.POST.get('body')
        
        Comment.objects.create(
            post=post,
            name=name,
            email=email,
            body=body,
            active=True  # Auto-approve comments for simplicity
        )
        
        messages.success(request, 'Your comment has been added!')
        return HttpResponseRedirect(post.get_absolute_url())
    
    return HttpResponseRedirect(post.get_absolute_url())

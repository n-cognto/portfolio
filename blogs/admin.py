from django.contrib import admin
from .models import Category, Tag, Post, Comment, PostSeries, PostSeriesOrder, PostBookmark, ReadingProgress

# Register your models here.

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'post_count', 'color')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')
    list_filter = ('created',) if hasattr(Category, 'created') else ()

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'color', 'created')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')
    list_filter = ('created',)

class PostSeriesOrderInline(admin.TabularInline):
    model = PostSeriesOrder
    extra = 1

@admin.register(PostSeries)
class PostSeriesAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'created')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [PostSeriesOrderInline]

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'author', 'category', 'difficulty_level', 'publish', 'status', 'is_featured', 'is_trending', 'views', 'likes', 'shares')
    list_filter = ('status', 'created', 'publish', 'author', 'category', 'is_featured', 'is_trending', 'difficulty_level', 'tags')
    search_fields = ('title', 'content', 'excerpt', 'meta_keywords')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('tags',)
    raw_id_fields = ('author',)
    date_hierarchy = 'publish'
    ordering = ('status', 'publish')
    list_editable = ('status', 'is_featured', 'is_trending')
    readonly_fields = ('views', 'likes', 'shares', 'read_percentage', 'created', 'updated')
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'slug', 'author', 'category', 'tags', 'difficulty_level')
        }),
        ('Content', {
            'fields': ('content', 'excerpt', 'featured_image', 'estimated_read_time', 'table_of_contents')
        }),
        ('SEO & Meta', {
            'fields': ('meta_title', 'meta_description', 'meta_keywords'),
            'classes': ('collapse',)
        }),
        ('Publishing & Features', {
            'fields': ('status', 'publish', 'is_featured', 'is_trending', 'featured_until')
        }),
        ('Social & Engagement', {
            'fields': ('allow_comments', 'enable_social_sharing'),
        }),
        ('Statistics', {
            'fields': ('views', 'likes', 'shares', 'read_percentage'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created', 'updated'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('author', 'category').prefetch_related('tags')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'post', 'created', 'active', 'is_reply')
    list_filter = ('active', 'created', 'updated')
    search_fields = ('name', 'email', 'body')
    actions = ['approve_comments']
    
    def approve_comments(self, request, queryset):
        queryset.update(active=True)
    approve_comments.short_description = "Mark selected comments as active"

@admin.register(PostBookmark)
class PostBookmarkAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'created')
    list_filter = ('created',)
    search_fields = ('user__username', 'post__title')

@admin.register(ReadingProgress)
class ReadingProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'progress_percentage', 'last_read')
    list_filter = ('last_read',)
    search_fields = ('user__username', 'post__title')

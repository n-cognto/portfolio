from django.contrib import admin
from .models import Subscriber, Newsletter, NewsletterTracking
from django.utils.html import format_html
from django.urls import path
from django.http import HttpResponseRedirect
from django.contrib import messages

@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'is_active', 'subscribed_date')
    list_filter = ('is_active', 'subscribed_date')
    search_fields = ('email', 'name')
    actions = ['activate_subscribers', 'deactivate_subscribers']
    
    def activate_subscribers(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f"{queryset.count()} subscribers were successfully activated.")
    activate_subscribers.short_description = "Activate selected subscribers"
    
    def deactivate_subscribers(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f"{queryset.count()} subscribers were successfully deactivated.")
    deactivate_subscribers.short_description = "Deactivate selected subscribers"


@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'status', 'created_at', 'sent_at', 'send_button')
    list_filter = ('status', 'created_at', 'sent_at')
    search_fields = ('title', 'subject', 'content')
    readonly_fields = ('created_at', 'updated_at', 'status', 'sent_at')
    fieldsets = (
        (None, {
            'fields': ('title', 'subject')
        }),
        ('Content', {
            'fields': ('content',)
        }),
        ('Status', {
            'fields': ('status', 'created_at', 'updated_at', 'sent_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:newsletter_id>/send/',
                self.admin_site.admin_view(self.send_newsletter),
                name='send-newsletter',
            ),
        ]
        return custom_urls + urls
    
    def send_newsletter(self, request, newsletter_id):
        newsletter = Newsletter.objects.get(id=newsletter_id)
        
        if newsletter.status == 'sent':
            self.message_user(
                request,
                f"Newsletter '{newsletter.title}' has already been sent.",
                level=messages.WARNING
            )
        else:
            result = newsletter.send_newsletter()
            if result:
                self.message_user(
                    request,
                    f"Newsletter '{newsletter.title}' was successfully sent to all active subscribers.",
                    level=messages.SUCCESS
                )
            else:
                self.message_user(
                    request,
                    f"Newsletter '{newsletter.title}' could not be sent. Please check if there are active subscribers.",
                    level=messages.ERROR
                )
        
        return HttpResponseRedirect("../")
    
    def send_button(self, obj):
        if obj.status == 'draft':
            return format_html(
                '<a class="button" href="{}">Send Newsletter</a>',
                f"/admin/newsletter/newsletter/{obj.id}/send/"
            )
        return format_html('<span style="color: green;">✓ Sent</span>')
    send_button.short_description = 'Send'
    send_button.allow_tags = True


@admin.register(NewsletterTracking)
class NewsletterTrackingAdmin(admin.ModelAdmin):
    list_display = ('newsletter', 'subscriber', 'opened', 'opened_at', 'clicked', 'clicked_at')
    list_filter = ('opened', 'clicked', 'opened_at', 'clicked_at')
    search_fields = ('newsletter__title', 'subscriber__email')
    readonly_fields = ('newsletter', 'subscriber', 'opened', 'opened_at', 'clicked', 'clicked_at')
    
    def has_add_permission(self, request):
        return False

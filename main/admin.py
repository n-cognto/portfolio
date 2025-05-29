from django.contrib import admin
from .models import Project, Skill, Certificate, Contact

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'created_date', 'technologies')
    list_filter = ('category', 'created_date')
    search_fields = ('title', 'description', 'technologies')

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)
    search_fields = ('name', 'category')

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('name', 'issuing_organization', 'issue_date')
    list_filter = ('issuing_organization', 'issue_date')
    search_fields = ('name', 'issuing_organization')

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at', 'is_read')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'message')
    readonly_fields = ('name', 'email', 'message', 'created_at')
    
    def has_add_permission(self, request):
        return False  # Prevent adding contacts manually

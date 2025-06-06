from django.urls import path
from . import views

app_name = 'blogs'

urlpatterns = [
    path('', views.post_list, name='post_list'),
    path('search/', views.post_list, name='search'),
    path('category/<slug:category_slug>/', views.post_list, name='category_detail'),
    path('tag/<slug:tag_slug>/', views.post_list, name='tag_detail'),
    path('archive/<int:year>/', views.archive_list, name='archive_year'),
    path('archive/<int:year>/<int:month>/', views.archive_list, name='archive_month'),
    path('<int:year>/<int:month>/<int:day>/<slug:post>/', views.post_detail, name='post_detail'),
    path('add_comment/<int:post_id>/', views.add_comment, name='add_comment'),
    path('like_post/<int:post_id>/', views.like_post, name='like_post'),
]
from django.urls import path
from . import views

app_name = 'main'

urlpatterns = [
    path('', views.home, name='home'),
    path('contact/', views.contact_form, name='contact_form'),
]
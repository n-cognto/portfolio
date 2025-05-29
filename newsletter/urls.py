from django.urls import path
from . import views

app_name = 'newsletter'

urlpatterns = [
    path('subscribe/', views.SubscribeView.as_view(), name='subscribe'),
    path('unsubscribe/', views.UnsubscribeView.as_view(), name='unsubscribe'),
    path('unsubscribe/success/', views.UnsubscribeSuccessView.as_view(), name='unsubscribe_success'),
    path('track/open/<str:tracking_id>/', views.TrackOpenView.as_view(), name='track_open'),
    path('track/click/<str:tracking_id>/', views.TrackClickView.as_view(), name='track_click'),
]
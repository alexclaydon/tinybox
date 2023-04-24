from django.urls import path

from . import views

urlpatterns = [
    path('approve_users/', views.approve_users, name='approve_users'),
]

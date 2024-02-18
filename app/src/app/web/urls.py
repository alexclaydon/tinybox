from auth_app.views import home
from django.contrib import admin
from django.urls import include, path
from world import views as world_views

urlpatterns = [
    path("map", world_views.map_view, name="map"),
    path("admin/", admin.site.urls),
    path('', home, name='home'),
    path("world/", include("world.urls")),
    path("__reload__/", include("django_browser_reload.urls")),
    path('accounts/', include('allauth.urls')),
    path('auth/', include('auth_app.urls')),
]


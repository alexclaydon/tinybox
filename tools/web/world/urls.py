from django.urls import path

from . import views

urlpatterns = [
    path("map/", views.map_view, name="map_view"),
    path("poi_geojson/", views.poi_geojson, name="poi_geojson"),
]

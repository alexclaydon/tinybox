from django.urls import path

from . import views

urlpatterns = [
    path("map/", views.map_view, name="map_view"),
    path ("sidebar/", views.map_Sidebar_temp, name="map_Sidebar_temp"),
    
    path("poi_geojson/", views.poi_geojson, name="poi_geojson"),
    path(
        "linefeature_geojson/",
        views.poi_geojson,
        name="linefeature_geojson",
    ),
]

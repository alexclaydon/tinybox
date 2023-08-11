from django.urls import path

from . import views

urlpatterns = [
    path("map/", views.map_view, name="map_view"),
    path("poi_geojson/", views.poi_geojson, name="poi_geojson"),
    path(
        "linefeature_geojson/",
        views.poi_geojson,
        name="linefeature_geojson",
    ),
    path(
        "get_map_layer_button/",
        views.ajax_get_map_layer_button.as_view(),
        name="get_map_layer_button",
    ),
]

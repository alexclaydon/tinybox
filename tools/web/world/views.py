from django.conf import settings
from django.core.serializers import serialize
from django.http import JsonResponse
from django.shortcuts import render

from .models import (
    ImageOverlay,
    LineFeature,
    MultiPolygonArea,
    PointOfInterest,
    PolygonArea,
    UserLocation,
)


def map_view(request):
    context = {
        "STADIA_MAPS_API_KEY": settings.STADIA_MAPS_API_KEY,
        "MAPBOX_API_KEY": settings.MAPBOX_API_KEY,
    }
    return render(request, "world/map.html", context)


def poi_geojson(request):
    poi_data = serialize(
        "geojson",
        PointOfInterest.objects.all(),
        geometry_field="geom",
        fields=("name", "description"),
    )
    return JsonResponse(poi_data, safe=False)


def linefeature_geojson(request):
    linefeature_data = serialize(
        "geojson",
        LineFeature.objects.all(),
        geometry_field="geom",
        fields=("name", "description"),
    )
    return JsonResponse(linefeature_data, safe=False)

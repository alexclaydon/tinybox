from auth_app.decorators import user_is_approved
from django.conf import settings
from django.contrib.auth.decorators import login_required
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


def map_Sidebar_temp(request):
    # return render(request, "world/map_Sidebar2.html")
    return render(request, "world/map_Sidebar/map_Sidebar copy.html")

# Temporarily disabled as we are using Ngrok auth instead
# @user_is_approved
def map_view(request):
    context = {
        "STADIA_MAPS_API_KEY": settings.STADIA_MAPS_API_KEY,
        "MAPBOX_API_KEY": settings.MAPBOX_API_KEY,
        "SPACES_KEY": settings.SPACES_KEY,
        "SPACES_SECRET": settings.SPACES_SECRET,
        "SPACES_CDN_ENDPOINT": settings.SPACES_CDN_ENDPOINT,
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

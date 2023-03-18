from django.core.serializers import serialize
from django.http import JsonResponse
from django.shortcuts import render

from .models import PointOfInterest


def map_view(request):
    return render(request, "world/map.html")


def poi_geojson(request):
    poi_data = serialize(
        "geojson",
        PointOfInterest.objects.all(),
        geometry_field="geom",
        fields=("name", "description"),
    )
    return JsonResponse(poi_data, safe=False)

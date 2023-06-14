from auth_app.decorators import user_is_approved
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.serializers import serialize
from django.http import JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string
from django.views import View

from .models import (
    ImageOverlay,
    LineFeature,
    MultiPolygonArea,
    PointOfInterest,
    PolygonArea,
    UserLocation,
)


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

# def ajax_get_map_layer(request):
#     id = request.GET.get('id', None)

#     # You might want to use the id variable here somehow...
#     # For now, we're not doing anything with it

#     html = render_to_string('world/map_layer_button.html', {'id': layer_id})

#     return JsonResponse({'html': html})

class ajax_get_map_layer_button(View):
    def get(self, request, *args, **kwargs):
        layer_id = request.GET.get('id', None)
        buttonType = request.GET.get('type', None)
        categoryID = request.GET.get('categoryID', None)
        category = request.GET.get('category', None)

        # print ("buttonType", buttonType)
        # print ("layer_id", layer_id)
        context = {
            "id": layer_id,
            "buttonType": buttonType,
            "categoryID": categoryID,
            "category": category,
        }

        print ("context", context)
        
        html = render_to_string('world/map_layer_button.html', context)
        return JsonResponse({'html': html})
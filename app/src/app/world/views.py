from time import sleep

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string
from django.views import View


# Django auth is temporarily disabled as we are using Ngrok auth instead
# @user_is_approved
def map_view(request):
    context = {
        "MAPBOX_API_KEY": settings.MAPBOX_API_KEY,
        # It is not insecure to pass the Mapbox API key to the client side because it is URL scoped
        "SPACES_ENDPOINT": settings.SPACES_ENDPOINT,
        "SPACES_CDN_ENDPOINT": settings.SPACES_CDN_ENDPOINT,
    }
    return render(request, "world/map.html", context)


# def poi_geojson(request):
#     poi_data = serialize(
#         "geojson",
#         PointOfInterest.objects.all(),
#         geometry_field="geom",
#         fields=("name", "description"),
#     )
#     return JsonResponse(poi_data, safe=False)


# def linefeature_geojson(request):
#     linefeature_data = serialize(
#         "geojson",
#         LineFeature.objects.all(),
#         geometry_field="geom",
#         fields=("name", "description"),
#     )
#     return JsonResponse(linefeature_data, safe=False)


class ajax_get_map_layer_button(View):
    MAX_RETRIES = 6  # Maximum number of retries
    INITIAL_DELAY = 1000  # Initial delay in seconds

    def get(self, request, *args, **kwargs):
        layer_id = request.GET.get("id", None)
        buttonType = request.GET.get("type", None)
        categoryID = request.GET.get("categoryID", None)
        category = request.GET.get("category", None)

        context = {
            "id": layer_id,
            "buttonType": buttonType,
            "categoryID": categoryID,
            "category": category,
        }

        retries = 0
        delay = self.INITIAL_DELAY

        while retries < self.MAX_RETRIES:
            try:
                html = render_to_string(
                    "world/map_layer_button.html", context
                )
                return JsonResponse({"html": html})
            except Exception as e:
                # Check for 503 status code in the exception
                if hasattr(e, "status_code") and e.status_code == 503:
                    sleep(delay)  # Wait before retrying
                    delay *= 2  # Double the delay for the next attempt
                    retries += 1
                else:
                    raise  # Rethrow if it's not a 503 error

        # Handle maximum retries reached
        # Log an error, raise an exception, or return a specific response as needed
        return JsonResponse(
            {"error": "Maximum retries reached"}, status=503
        )

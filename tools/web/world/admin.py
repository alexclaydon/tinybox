from django.contrib import admin

from .models import (
    Category,
    ImageOverlay,
    LineFeature,
    MultiPolygonArea,
    PointOfInterest,
    PolygonArea,
    UserLocation,
    WorldBorder,
)

# Register your models here.

admin.site.register(WorldBorder, admin.ModelAdmin)
admin.site.register(PointOfInterest, admin.ModelAdmin)
admin.site.register(PolygonArea, admin.ModelAdmin)
admin.site.register(MultiPolygonArea, admin.ModelAdmin)
admin.site.register(LineFeature, admin.ModelAdmin)
admin.site.register(Category, admin.ModelAdmin)
admin.site.register(UserLocation, admin.ModelAdmin)
admin.site.register(ImageOverlay, admin.ModelAdmin)

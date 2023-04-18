from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.gis.db import models


class WorldBorder(models.Model):
    # Regular Django fields corresponding to the attributes in the
    # world borders shapefile.
    name = models.CharField(max_length=50)
    area = models.IntegerField()
    pop2005 = models.IntegerField("Population 2005")
    fips = models.CharField("FIPS Code", max_length=2, null=True)
    iso2 = models.CharField("2 Digit ISO", max_length=2)
    iso3 = models.CharField("3 Digit ISO", max_length=3)
    un = models.IntegerField("United Nations Code")
    region = models.IntegerField("Region Code")
    subregion = models.IntegerField("Sub-Region Code")
    lon = models.FloatField()
    lat = models.FloatField()
    mpoly = models.MultiPolygonField()

    # Returns the string representation of the model.
    def __str__(self):
        return self.name


class PointOfInterest(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey("Category", on_delete=models.SET_NULL, null=True)
    geom = models.PointField()

    # Returns the string representation of the model.
    def __str__(self):
        return self.name


class PolygonArea(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey("Category", on_delete=models.SET_NULL, null=True)
    geom = models.PolygonField()

    # Returns the string representation of the model.
    def __str__(self):
        return self.name


class MultiPolygonArea(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey("Category", on_delete=models.SET_NULL, null=True)
    geom = models.MultiPolygonField()

    # Returns the string representation of the model.
    def __str__(self):
        return self.name


class LineFeature(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey("Category", on_delete=models.SET_NULL, null=True)
    geom = models.LineStringField()

    # Returns the string representation of the model.
    def __str__(self):
        return self.name


class UserLocation(models.Model):
    # user = models.ForeignKey(User, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    geom = models.PointField()

    def __str__(self):
        return self.name


class ImageOverlay(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to="image_overlays/")
    north = models.FloatField()
    south = models.FloatField()
    east = models.FloatField()
    west = models.FloatField()

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

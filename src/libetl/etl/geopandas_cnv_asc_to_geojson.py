import geopandas as gpd
import numpy as np
import rasterio
from pyproj import CRS
from rasterio import features
from shapely.geometry import Polygon


def asc_to_geojson(asc_file, prj_file, output_file):
    # Read the .asc file using rasterio
    with rasterio.open(asc_file) as src:
        data_array = src.read(1)
        transform = src.transform

    # Get unique values in the data array
    unique_values = np.unique(data_array)

    # Create a list to store the polygons
    polygons = []

    # Loop through the unique values and create a polygon for each value
    for value in unique_values:
        if np.isnan(value):  # Ignore NaN values
            continue

        # Create a mask for the current value
        mask = data_array == value

        # Convert the mask to a polygon using rasterio.features.shapes
        for shape, _ in features.shapes(
            mask.astype(np.int16), transform=transform
        ):
            # Add the polygon and the value as a property
            polygons.append(
                (Polygon(shape["coordinates"][0]), {"value": value})
            )

    # Create a GeoDataFrame from the polygons
    gdf = gpd.GeoDataFrame.from_records(
        polygons, columns=["geometry", "properties"]
    )

    # Set the CRS using the .prj file
    with open(prj_file) as f:
        wkt = f.read()
    gdf.crs = CRS.from_wkt(wkt)

    # Reproject the GeoDataFrame to WGS84 (EPSG:4326) if needed
    gdf = gdf.to_crs("EPSG:4326")

    # Save the GeoDataFrame as a GeoJSON file
    gdf.to_file(output_file, driver="GeoJSON")


# Example usage:
asc_file = "/Users/alexclaydon/dev/dev-projects/tinybox-data/data/static/national/bom/static/solarwet/solarwet.asc"
prj_file = "/Users/alexclaydon/dev/dev-projects/tinybox-data/data/static/national/bom/static/solarwet/solarwet.prj"
output_file = "/Users/alexclaydon/dev/dev-projects/tinybox-data/data/static/national/bom/static/solarwet/solarwet.geojson"
asc_to_geojson(asc_file, prj_file, output_file)

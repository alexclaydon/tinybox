import os

from osgeo import gdal, osr


def asc_to_geojson(asc_file, prj_file, output_file):
    # Open the .asc raster file
    raster = gdal.Open(asc_file)

    # Read the .prj projection file
    with open(prj_file, "r") as f:
        prj_content = f.read()
    source_srs = osr.SpatialReference()
    source_srs.ImportFromWkt(prj_content)

    # Create the output file
    driver = gdal.GetDriverByName("GeoJSON")
    if os.path.exists(output_file):
        os.remove(output_file)

    # Reproject to WGS84 (EPSG:4326) if needed
    target_srs = osr.SpatialReference()
    target_srs.ImportFromEPSG(4326)
    raster = gdal.Warp("", raster, format="VRT", dstSRS=target_srs)

    # Convert raster to vector (GeoJSON) using the polygonize method
    ds = driver.Create(output_file, 0, 0, 0, gdal.GDT_Unknown)
    ds.SetProjection(target_srs.ExportToWkt())
    gdal.Polygonize(
        raster.GetRasterBand(1),
        None,
        ds.GetLayer(0),
        -1,
        [],
        callback=None,
    )

    # Close the files
    ds = None
    raster = None


# Example usage:
asc_file = "input.asc"
prj_file = "input.prj"
output_file = "output.geojson"
asc_to_geojson(asc_file, prj_file, output_file)

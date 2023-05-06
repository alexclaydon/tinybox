const spaces_api_key = JSON.parse(
  document.getElementById("spaces_api_key").textContent
);

const spaces_api_secret = JSON.parse(
  document.getElementById("spaces_api_secret").textContent
);

const spaces_cdn_endpoint = JSON.parse(
  document.getElementById("spaces_cdn_endpoint").textContent
);

export async function fetchMapSources() {
  try {
    const response = await fetch("/static/world/map_sources.json");

    if (!response.ok) {
      const message = `An error has occurred: ${response.status}`;
      throw new Error(message);
    }
    let mapSources = await response.json();

    // Perform string substitution for spaces_cdn_endpoint
    for (let sourceKey in mapSources) {
      let source = mapSources[sourceKey];
      if (source.url && source.url.includes("__SPACES_CDN_ENDPOINT__")) {
        source.url = source.url.replace(
          "__SPACES_CDN_ENDPOINT__",
          spaces_cdn_endpoint
        );
      }
    }

    return mapSources;
  } catch (error) {
    console.error("Error fetching mapSources.json:", error);
  }
}

export async function fetchMapLayers() {
  try {
    const response = await fetch("/static/world/map_layers.json");

    if (!response.ok) {
      const message = `An error has occurred: ${response.status}`;
      throw new Error(message);
    }
    let mapLayers = await response.json();

    // Loop through mapLayers
    for (const layerId in mapLayers) {
      // Check if the layer has the desired metadata property
      if (
        mapLayers[layerId].metadata &&
        mapLayers[layerId].metadata["paint-style"] === "line-sunrise"
      ) {
        mapLayers[layerId].paint = {
          "line-color": [
            "step",
            ["get", "ALLVEHS_AADT"],
            "#0198BD",
            5000,
            "#49E3CE",
            10000,
            "#E8FEB5",
            15000,
            "#FEEDB1",
            20000,
            "#FEAD54",
            35000,
            "#D50255",
          ],
          "line-opacity": 1,
          "line-width": 2.5,
        };
      }
      if (
        mapLayers[layerId].metadata &&
        mapLayers[layerId].metadata["paint-style"] === "poly-heatmap"
      ) {
        mapLayers[layerId].paint = {
          "fill-color": [
            "step",
            ["get", "DN"],
            "#FFC300",
            15,
            "#F1920E",
            17,
            "#E3611C",
            20,
            "#C70039",
            22,
            "#900C3F",
            24,
            "#5A1846",
          ],
          "fill-opacity": 0.7,
        };
      }
      if (
        mapLayers[layerId].metadata &&
        mapLayers[layerId].metadata["paint-style"] === "unemployment-heatmap"
      ) {
        mapLayers[layerId].paint = {
          "fill-color": [
            "step",
            ["to-number", ["get", "Unemployment rate (%)"]],
            "#FEEBE2",
            3.0,
            "#FCC5C0",
            4.0,
            "#FA9FB5",
            5.0,
            "#F768A1",
            6.0,
            "#C51B8A",
            7.0,
            "#7A0177",
          ],
          "fill-opacity": 0.8,
        };
      }
      if (
        mapLayers[layerId].metadata &&
        mapLayers[layerId].metadata["paint-style"] === "median-age-heatmap"
      ) {
        mapLayers[layerId].paint = {
          "fill-color": [
            "step",
            ["to-number", ["get", "Median age - persons (years)"]],
            "#EDF8FB",
            30,
            "#CCECE6",
            35,
            "#99D8C9",
            40,
            "#66C2A4",
            45,
            "#2CA25F",
            50,
            "#006D2C",
          ],
          "fill-opacity": 0.8,
        };
      }
    }

    return mapLayers;
  } catch (error) {
    console.error("Error fetching mapSources.json:", error);
  }
}

// Incomplete: will eventually be used to color features based on a value
export function getFeatureColor(value) {
  if (value <= 5000) return "#00ff00";
  if (value <= 10000) return "#ffff00";
  if (value <= 20000) return "#ff7f00";
  return "#ff0000";
}

// Fetch GeoJSON data from any Django API endpoint
export async function fetchGeoJSONData(apiUrl) {
  const response = await fetch(apiUrl);

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  const geojsonData = await response.json();
  return JSON.parse(geojsonData);
}

// Add markers to the map from a GeoJSON API endpoint
export async function addMarkers(apiUrl) {
  // Usage example:
  // addMarkers((apiUrl = "/world/poi_geojson/"));
  try {
    const PoIData = await fetchGeoJSONData(apiUrl);

    console.log(PoIData); // Add this line to check the structure of the fetched data

    // Replace the following line with your actual marker creation logic
    PoIData.features.forEach(function (point) {
      var elem = document.createElement("div");
      elem.className = "marker";

      var marker = new maplibregl.Marker(elem);
      marker.setLngLat(point.geometry.coordinates);

      var popup = new maplibregl.Popup({ offset: 24, closeButton: false });
      popup.setHTML("<div>" + point.properties.name + "</div>");

      marker.setPopup(popup);

      marker.addTo(map);
    });
  } catch (error) {
    console.error(error.message);
  }
}

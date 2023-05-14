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

async function generatePaintExpression(
  paintStyle,
  paintVariableMinMax,
  paintVariable
) {
  const paintStylesResponse = await fetch("/static/world/paint_styles.json");
  const paintStyles = await paintStylesResponse.json();

  const colors = paintStyles[paintStyle].colors;

  const min = paintVariableMinMax[0];
  const max = paintVariableMinMax[1];
  const stepSize = (max - min) / (colors.length - 1);
  const paintSteps = Array.from(
    { length: colors.length - 1 },
    (_, i) => min + (i + 1) * stepSize
  );

  const colorExpression = ["step", ["to-number", ["get", paintVariable]]];
  let startIndex = 0;

  if (colors.length > paintSteps.length) {
    colorExpression.push(colors[0]);
    startIndex = 1;
  }

  for (let i = startIndex; i < colors.length; i++) {
    colorExpression.push(paintSteps[i - startIndex], colors[i]);
  }

  return colorExpression;
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
      const metadata = mapLayers[layerId].metadata;
      if (metadata && metadata["paint-style"]) {
        const paintStyle = metadata["paint-style"];
        const paintVariableMinMax = metadata["paint-variable-min-max"];
        const paintVariable = metadata["paint-variable"];

        const colorExpression = await generatePaintExpression(
          paintStyle,
          paintVariableMinMax,
          paintVariable
        );

        if (paintStyle === "sunrise") {
          mapLayers[layerId].paint = {
            "line-color": colorExpression,
            "line-opacity": 1,
            "line-width": 2.5,
          };
        } else {
          mapLayers[layerId].paint = {
            "fill-color": colorExpression,
            "fill-opacity": 0.8,
          };
        }
      }
    }

    return mapLayers;
  } catch (error) {
    console.error("Error fetching mapSources.json:", error);
  }
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

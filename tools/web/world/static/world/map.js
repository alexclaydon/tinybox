// Import API keys: Note that it's not yet clear to me whether this is secure although I understand that it probably is
const mapbox_api_key = JSON.parse(
  document.getElementById("mapbox_api_key").textContent
);

const stadiaMapsApiKey = JSON.parse(
  document.getElementById("stadia_maps_api_key").textContent
);

const spaces_api_key = JSON.parse(
  document.getElementById("spaces_api_key").textContent
);

const spaces_api_secret = JSON.parse(
  document.getElementById("spaces_api_secret").textContent
);

const spaces_cdn_endpoint = JSON.parse(
  document.getElementById("spaces_cdn_endpoint").textContent
);

// Show an alert if the browser does not support MapLibre GL
if (!maplibregl.supported()) {
  alert("Your browser does not support MapLibre GL");
}

// Initialize tiling protocol
let protocol = new pmtiles.Protocol();
console.log("Initialized PMTiles protocol:", protocol);
maplibregl.addProtocol("pmtiles", protocol.tile);

let PMTILES_URL = spaces_cdn_endpoint + "output.pmtiles";
// If you remove the `http`, it will try to look for a flat out incorrect URL (it will actually apprend it directly to the url of the map itself.  So dont remove it)

const p = new pmtiles.PMTiles(PMTILES_URL);
console.log("Created PMTiles instance:", p);

// This is so we share one instance across the JS code and the map renderer
protocol.add(p);

(async () => {
  const mapStyle = await fetchMapStyle();

  const map = new maplibregl.Map({
    container: "map",
    center: [144.946457, -37.840935], // Initial focus coordinate (long, lat)
    zoom: 9,
    style: mapStyle, // Replace the existing style URL with the fetched mapStyle object
  });

  map.on("load", () => {
    try {
      // Add a vector source
      map.addSource("vector-source", {
        type: "vector",
        url: "pmtiles://" + PMTILES_URL,
      });

      map.addLayer({
        id: "vector-layer",
        type: "circle",
        source: "vector-source",
        "source-layer": "testlayer02",
        layout: {
          // Make the layer visible by default.
          visibility: "visible",
        },
        paint: {
          "circle-radius": 5,
          "circle-color": "#007cbf",
          "circle-opacity": 0.8,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });

      console.log("Added vector source and layer information");
    } catch (error) {
      console.error(
        "An error occurred while adding vector source and layers:",
        error
      );
    }
  });

  map.on("idle", () => {
    // If these two layers were not added to the map, abort
    if (!map.getLayer("vector-layer")) {
      return;
    }

    // Enumerate ids of the layers.
    const toggleableLayerIds = ["vector-layer"];

    // Set up the corresponding toggle button for each layer.
    for (const id of toggleableLayerIds) {
      // Skip layers that already have a button set up.
      if (document.getElementById(id)) {
        continue;
      }

      // Create a link.
      const link = document.createElement("a");
      link.id = id;
      link.href = "#";
      link.textContent = id;
      link.className = "active";

      // Show or hide layer when the toggle is clicked.
      link.onclick = function (e) {
        const clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();

        const visibility = map.getLayoutProperty(clickedLayer, "visibility");

        // Toggle layer visibility by changing the layout object's visibility property.
        if (visibility === "visible") {
          map.setLayoutProperty(clickedLayer, "visibility", "none");
          this.className = "";
        } else {
          this.className = "active";
          map.setLayoutProperty(clickedLayer, "visibility", "visible");
        }
      };

      const layers = document.getElementById("layer-controls");
      layers.appendChild(link);
    }
  });

  // Add Mapbox geocoder to the map
  var geocoder = new MapboxGeocoder({
    accessToken: mapbox_api_key,
    countries: "au",
    language: "en-AU",
    maplibregl: maplibregl,
  });

  map.addControl(geocoder, "bottom-right");

  geocoder.on("result", async (event) => {
    console.log(event.result);
    // When the geocoder returns a result
    const point = event.result.center; // Capture the result coordinates

    var elem = document.createElement("div");
    elem.className = "marker";

    var marker = new maplibregl.Marker(elem);

    marker.setLngLat(point); // Add the marker to the map at the result coordinates

    var popup = new maplibregl.Popup({ offset: 24, closeButton: false });
    popup.setHTML("<div>" + event.result.place_name + "</div>");

    marker.setPopup(popup);

    marker.addTo(map);
  });

  // Add zoom and rotation controls to the map.
  map.addControl(new maplibregl.NavigationControl());

  // Add geolocate control to the map.
  var geolocate = new maplibregl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  });

  map.addControl(geolocate);

  // Set an event listener that fires
  // when a trackuserlocationstart event occurs.
  geolocate.on("trackuserlocationstart", function () {
    console.log("A trackuserlocationstart event has occurred.");
  });

  // Add a scale control to the map.
  var scale = new maplibregl.ScaleControl({
    maxWidth: 80,
    unit: "metric",
  });

  map.addControl(scale);

  scale.setUnit("metric");

  // Add fullscreen control to the map.
  map.addControl(
    new maplibregl.FullscreenControl({
      container: document.querySelector("body"),
    })
  );
})();

// Fetch custom map stylesheet
async function fetchMapStyle() {
  try {
    const response = await fetch("/static/world/map_style.json");

    if (!response.ok) {
      const message = `An error has occurred: ${response.status}`;
      throw new Error(message);
    }

    const mapStyle = await response.json();
    return mapStyle;
  } catch (error) {
    console.error("Error fetching map_style.json:", error);
  }
}

// Fetch GeoJSON data from any Django API endpoint
async function fetchGeoJSONData(apiUrl) {
  const response = await fetch(apiUrl);

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  const geojsonData = await response.json();
  return JSON.parse(geojsonData);
}

async function addMarkers(apiUrl) {
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

// addMarkers((apiUrl = "/world/poi_geojson/"));

// async function addLineFeatures(apiUrl) { }

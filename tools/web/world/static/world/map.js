// Show an alert if the browser does not support MapLibre GL
if (!maplibregl.supported()) {
  alert("Your browser does not support MapLibre GL");
}

// Initialize tiling protocol
let protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

// let PMTILES_URL = "localhost:8081/output.pmtiles";

// const p = new pmtiles.PMTiles(PMTILES_URL)

// protocol.add(p);

// Initialize the base map
var map = new maplibregl.Map({
  container: "map",
  center: [144.946457, -37.840935], // Initial focus coordinate (long, lat)
  zoom: 9,
  style: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
});

const mapbox_api_key = JSON.parse(
  document.getElementById("mapbox_api_key").textContent
);

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
  maxWidth: 100,
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

addMarkers((apiUrl = "/world/poi_geojson/"));

// async function addLineFeatures(apiUrl) { }

map.on("load", function () {
  map.addSource("landuse", {
    type: "vector",
    url: "pmtiles://localhost:8081/output.pmtiles", // It's not clear to me whether this should be `url` or `tiles` but I'm going to experiment with both.  It's possible that it's tiles for local and url when we're hosting remotely.
    // its also not clear to me whether the `pmtiles://` stem is required.  I get a different error when I remove it vs when it's present.
  });
  map.addLayer({
    id: "polygon-layer",
    type: "fill",
    source: "landuse",
    "source-layer": "testlayer01", // Replace this with the actual source layer name from your PMTiles
    paint: {
      "fill-color": "#088", // Set the fill color for the polygons
      "fill-opacity": 0.8, // Set the fill opacity for the polygons
    },
  });
});

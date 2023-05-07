// Import custom map controls
import { LayerToggleControl, ModeSwitchControl } from "./controls.js";
import { fetchMapSources, fetchMapLayers } from "./features.js";

// Import API keys: To be confirmed whether this is actually secure
const mapbox_api_key = JSON.parse(
  document.getElementById("mapbox_api_key").textContent
);

const stadiaMapsApiKey = JSON.parse(
  document.getElementById("stadia_maps_api_key").textContent
);

// Show an alert if the browser does not support MapLibre GL
if (!maplibregl.supported()) {
  alert("Your browser does not support MapLibre GL");
}

// Initialize tiling protocol
let protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);
console.log("Initialized PMTiles protocol:", protocol);

let mediaQueryObj = window.matchMedia("(prefers-color-scheme: dark)");
let isDarkMode = mediaQueryObj.matches;

let activeMode = isDarkMode ? "dark" : "light";

const lightStyleUrl = "/static/world/map_style.json";
const darkStyleUrl =
  "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json";

const initialMapLayers = [];

(async () => {
  const [lightStyle, darkStyle] = await Promise.all([
    fetchMapStyle(lightStyleUrl),
    fetchMapStyle(darkStyleUrl),
  ]);

  console.log(lightStyle);
  console.log(darkStyle);

  function getStyleByMode(mode) {
    return mode == "dark" ? lightStyle : lightStyle;
  }

  const mapSources = await fetchMapSources();
  console.log(mapSources);

  const mapLayers = await fetchMapLayers();
  console.log(mapLayers);

  const map = new maplibregl.Map({
    container: "map",
    center: [144.946457, -37.840935], // Initial focus coordinate (long, lat)
    zoom: 8,
    style: getStyleByMode(activeMode),
    attributionControl: false,
  });

  map.on("load", () => {
    try {
      // Add sources
      for (const source in mapSources) {
        map.addSource(source, mapSources[source]);
      }

      for (const layer in mapLayers) {
        if (initialMapLayers.includes(layer)) {
          mapLayers[layer].id = layer;
          map.addLayer(mapLayers[layer]);
          map.setLayoutProperty(layer, "visibility", "visible");
        }
      }

      console.log("Added vector source and layer information");
    } catch (error) {
      console.error(
        "An error occurred while adding vector source and layers:",
        error
      );
    }
  });

  map.on("idle", () => {
    // Enumerate ids of the layers.
    const toggleableLayerIds = Object.keys(mapLayers);

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
      link.className = initialMapLayers.includes(id) ? "active" : "";

      // Show or hide layer when the toggle is clicked.
      link.onclick = function (e) {
        const clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();

        if (!map.getLayer(clickedLayer)) {
          // Add the layer if it's not on the map yet
          mapLayers[clickedLayer].id = clickedLayer;
          map.addLayer(mapLayers[clickedLayer]);
        }

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

      const layerControls = document.getElementById("layers-contents");
      const listItem = document.createElement("li");
      listItem.classList.add("px-6", "py-4");
      listItem.appendChild(link);
      layerControls.appendChild(listItem);
    }

    async function switchMode(mode) {
      activeMode = mode;
      const style = getStyleByMode(mode);
      await map.setStyle(style); // Add "await" here

      // Restore the visibility of layers
      map.on("styledata", () => {
        console.log("Style data changed");
        try {
          // Add sources
          for (const source in mapSources) {
            map.addSource(source, mapSources[source]);
          }

          for (const layer in mapLayers) {
            if (initialMapLayers.includes(layer)) {
              mapLayers[layer].id = layer;
              map.addLayer(mapLayers[layer]);
              map.setLayoutProperty(layer, "visibility", "visible");
            }
          }

          console.log("Added vector source and layer information");
        } catch (error) {
          console.error(
            "An error occurred while adding vector source and layers:",
            error
          );
        }
      });
    }

    document
      .getElementById("modeSwitch")
      .addEventListener("click", function () {
        if (activeMode === "light") {
          switchMode("dark");
        } else if (activeMode === "dark") {
          switchMode("light");
        }
      });
  });

  map.on("click", "CBD building information", function (e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.street_address;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
  });

  map.on("mousemove", function (e) {
    var features = map.queryRenderedFeatures(e.point);

    // Limit the number of properties we're displaying for
    // legibility and performance
    var displayProperties = ["properties"];

    var displayFeatures = features.map(function (feat) {
      var displayFeat = {};
      displayProperties.forEach(function (prop) {
        displayFeat[prop] = feat[prop];
      });
      return displayFeat;
    });

    document.getElementById("info").innerHTML = JSON.stringify(
      displayFeatures,
      null,
      2
    );
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

  map.addControl(new LayerToggleControl(), "bottom-right");

  // Add a scale control to the map.
  var scale = new maplibregl.ScaleControl({
    maxWidth: 100,
    unit: "metric",
  });

  map.addControl(scale, "top-right");

  scale.setUnit("metric");

  // Add zoom and rotation controls to the map.
  map.addControl(new maplibregl.NavigationControl(), "bottom-right");

  // Add geolocate control to the map.
  var geolocate = new maplibregl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  });

  map.addControl(geolocate, "bottom-right");

  // Set an event listener that fires
  // when a trackuserlocationstart event occurs.
  geolocate.on("trackuserlocationstart", function () {
    console.log("A trackuserlocationstart event has occurred.");
  });

  const legendLayers = {};

  map.addControl(
    new MaplibreLegendControl(legendLayers, {
      showDefault: false,
      showCheckbox: true,
      onlyRendered: true,
      reverseOrder: true,
    }),
    "bottom-right"
  );

  map.addControl(new ModeSwitchControl(), "bottom-left");

  // // Add fullscreen control to the map.
  // map.addControl(
  //   new maplibregl.FullscreenControl({
  //     container: document.querySelector("body"),
  //   }),
  //   "top-right"
  // );
})();

// Fetch custom map stylesheet
async function fetchMapStyle(url) {
  try {
    const response = await fetch(url);

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

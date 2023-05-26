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

// function createLayerItem(link3, layerName, layerDescription) {
//   // Create necessary elements
//   const listItem = document.createElement("li");
  
//   listItem.appendChild(link3);

//   return listItem;
// }

// Temporary variable to store layer names
let defaultDisplayedLayers = [
  "Average annual traffic volume",
  // "Average annual traffic volume_ALT",
  "Future land development",
  "Open spaces",
  // "Areas within walking distance (400m) of public space",
  "CBD bike routes",
  // "CBD bike-share docks",
  // "Average solar radiation in Summer",
  // "Unemployment rate (%)",
  // "Median population age",
  "Crime rate (per 100k ppl)",
  // "CBD building information",
  "School locations"
]

const layerMetaData = {
  "Average annual traffic volume": {
      "category": "Category 1",
      "summary_description": "",
      "full_description": "",
  },
  "Average annual traffic volume_ALT": {
    "category": "Category 1",
    "summary_description": "",
    "full_description": "",
  },
  "Future land development": {
    "category": "Category 1",
    "summary_description": "",
    "full_description": "",
  },
  "Open spaces": {
    "category": "Category 1",
    "summary_description": "",
    "full_description": "",
  },
  "Areas within walking distance (400m) of public space": {
    "category": "Category 1",
    "summary_description": "",
    "full_description": "",
  },
  "CBD bike routes": {
    "category": "Category 3",
    "summary_description": "",
    "full_description": "",
  },
  "CBD bike-share docks": {
    "category": "Category 3",
    "summary_description": "",
    "full_description": "",
  },
  "Average solar radiation in Summer": {
    "category": "Category 1",
    "summary_description": "",
    "full_description": "",
  },
  "Unemployment rate (%)": {
    "category": "Category 2",
    "summary_description": "",
    "full_description": "",
  },
  "Median population age": {
    "category": "Category 2",
    "summary_description": "",
    "full_description": "",
  },
  "Crime rate (per 100k ppl)": {
    "category": "Category 2",
    "summary_description": "",
    "full_description": "",
  },
  "CBD building information": {
    "category": "Category 2",
    "summary_description": "",
    "full_description": "",
  },
  "School locations": {
    "category": "Category 2",
    "summary_description": "",
    "full_description": "",
  },
};

let DisplayedLayers = JSON.parse(localStorage.getItem('DisplayedLayers')) || defaultDisplayedLayers; // Retrieve DisplayedLayers from localStorage

function toggleButton(button) {
  if (button.dataset.state === 'off') {
    button.classList.add('border-[#00ffda]', 'border-t-[#00aa95]', 'border-l-[#00aa95]', 'bg-neutral-100');
    DisplayedLayers.push(button.dataset.layerId);
    button.dataset.state = 'on';
  } else {
    button.classList.remove('border-[#00ffda]', 'border-t-[#00aa95]', 'border-l-[#00aa95]', 'bg-neutral-100');
    DisplayedLayers = DisplayedLayers.filter(id => id !== button.dataset.layerId);
    button.dataset.state = 'off';
  }
  localStorage.setItem('DisplayedLayers', JSON.stringify(DisplayedLayers)); // Save DisplayedLayers to localStorage
}

document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById('layer-addremove-buttons').addEventListener('click', function(e) {
    var buttonElement = e.target.closest('.layer-button');
    if (buttonElement) {
      console.log("clicked to add/remove layer:", buttonElement.dataset.layerId)
      toggleButton(buttonElement);
    } else {
      console.log ("no match", e.target)
    }
    updateToggleButtons(); 
  });
});

// Initialize buttons on page load
function initialiseLayerButtons(){
  document.querySelectorAll('.layer-button').forEach(button => {
    // Check if button's layerId is in DisplayedLayers
    if (DisplayedLayers.includes(button.dataset.layerId)) {
      // If it is, set the button to 'on' state
      button.dataset.state = 'on';
      button.classList.add('border-[#00ffda]', 'border-t-[#00aa95]', 'border-l-[#00aa95]', 'bg-neutral-100');
    } else {
      // If it's not, set the button to 'off' state
      button.dataset.state = 'off';
      button.classList.remove('border-[#00ffda]', 'border-t-[#00aa95]', 'border-l-[#00aa95]', 'bg-neutral-100');
    }
  });
};

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
  
  let createLayerShowHideButtons = (id) => {
    let element = document.getElementById("layers-show-hide-buttons");
    let dataUrl = element.getAttribute('data-url');
    console.log(dataUrl); // Prints the value of data-url
    console.log("this id", id); // Prints the value of data-url

    if (DisplayedLayers.includes(id)) {
    
      // let url = new URL(window.location.origin + '/get_map_layer_button/');
      let url = new URL(window.location.origin + dataUrl);
    
      // Add data to the query string
      url.searchParams.append('id', id);
    
      // Make the request
      fetch(url)
        .then(response => response.json())
        .then(data => {
          const layerControls = document.getElementById("layers-show-hide-buttons");
          
          // Create a temporary container and append the HTML to it
          let tempContainer = document.createElement('div');
          tempContainer.innerHTML = data.html;
    
          // Get the first (and only) child node of the container (this is your new HTML)
          let newElement = tempContainer.firstElementChild;
    
          // Append the new HTML to the DOM
          layerControls.appendChild(newElement);
    
          // Extract the ID from the new element's data-id attribute
          const elementId = newElement.getAttribute('data-id');
    
          // The new HTML is now in the DOM, so we can attach event listeners.

          newElement.addEventListener('click', function(e) {
            console.log("this", this)
            console.log("this.textContent", this.textContent)
            const clickedLayer = elementId;
            console.log("clickedLayer", clickedLayer)
            e.preventDefault();
            e.stopPropagation();
            console.log("map.getLayer(clickedLayer)", map.getLayer(clickedLayer))
          
            if (!map.getLayer(clickedLayer)) {
              // Add the layer if it's not on the map yet
              mapLayers[clickedLayer].id = clickedLayer;
              map.addLayer(mapLayers[clickedLayer]);
            }
          
            const visibility = map.getLayoutProperty(clickedLayer, "visibility");
          
            // Toggle layer visibility by changing the layout object's visibility property.
            if (visibility === "visible") {
              map.setLayoutProperty(clickedLayer, "visibility", "none");
              this.classList.remove("active");
            } else {
              this.classList.add("active");
              map.setLayoutProperty(clickedLayer, "visibility", "visible");
            }
          });
    
        })
        .catch(err => {
          console.error('Error:', err);
        });
      };
    
    };

  const mapSources = await fetchMapSources();
  console.log(mapSources);

  const mapLayers = await fetchMapLayers();
  console.log("maplayers", mapLayers);

  const map = new maplibregl.Map({
    container: "map",
    center: [144.946457, -37.840935], // Initial focus coordinate (long, lat)
    zoom: 8,
    style: getStyleByMode(activeMode),
    attributionControl: false,
  });

  function updateToggleButtons() {
    // Get container of yourLayers
    const yourLayers = document.getElementById('layers-show-hide-buttons');

    // Clear all current toggles
    yourLayers.innerHTML = '';

    // Enumerate ids of the layers.
    const toggleableLayerIds = Object.keys(mapLayers);

    // Set up the corresponding toggle button for each layer.
    for (const id of toggleableLayerIds) {
      // ... existing code to create toggles ...
      createLayerShowHideButtons(id);
    }
  }

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

      // >>>OLD LAYER CONTROL CODE<<<

      // Create a link.
      const link = document.createElement("a");
      link.id = id;
      link.href = "#";
      link.textContent = id;
      link.className = initialMapLayers.includes(id) ? "active" : "";

      // Show or hide layer when the toggle is clicked.
      link.onclick = function (e) {
        const clickedLayer = this.textContent;
        console.log("clickedLayer", clickedLayer)
        e.preventDefault();
        e.stopPropagation();
        console.log("map.getLayer(clickedLayer)", map.getLayer(clickedLayer))

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
      // const newItem = createLayerItem(link, "Layer 1 description.")
      listItem.classList.add("px-6", "py-4");
      listItem.appendChild(link);
      layerControls.appendChild(listItem);
      console.log("listItem", listItem)

       // >>>NEW LAYER CONTROL CODE<<<

      // Create each "Add Layers" buttons

      // Create filter buttons for adding and removing layers
      const layer_button = document.createElement("button");
      const layer_div = document.createElement("div");
      const layer_h1 = document.createElement("h1");
      const layer_p = document.createElement("p");

      // Add necessary classes
      layer_button.classList.add("layer-button", "border-[#00aa95]", "border-2", "border-t-[#00ffda]", "border-l-[#00ffda]", "bg-white", "text-left", "px-4", "w-full");
      layer_button.setAttribute("data-layer-id", id);
      layer_div.classList.add("flex", "flex-col", "h-full");

      // Add content
      layer_h1.classList.add("pt-4", "font-semibold");
      layer_h1.textContent = id;
      layer_p.classList.add("pb-4", "text-sm");
      layer_p.textContent = `this is a placeholder for the description of ${id} layer`;

      // Combine the elements
      layer_div.appendChild(layer_h1);
      layer_div.appendChild(layer_p);
      layer_button.appendChild(layer_div);

      // Get correct category div (or create it if it does not yet exist)
   
      const layerAddRemove = document.getElementById("layer-addremove-buttons");
      console.log("category", layerMetaData[id]["category"])

      let idWithoutSpaces = layerMetaData[id]["category"].replace(/\s+/g, '');
      let category_div = document.getElementById(idWithoutSpaces);

      // if category div does not exist, create it
      if (!category_div) {
          category_div = document.createElement("div");

          // add ids
          category_div.id = idWithoutSpaces;
          category_div.setAttribute("data-category-id", idWithoutSpaces);

          // Create category div and add button
          let category_p = document.createElement("p");
          category_p.className = "px-4 pb-4 font-semibold";
          category_p.textContent = layerMetaData[id]["category"];
          category_div.appendChild(category_p);

          let br = document.createElement("br");

          // Append it to the layerAddRemove element
          layerAddRemove.appendChild(category_div);
          layerAddRemove.appendChild(br);
      }

      category_div.appendChild(layer_button);

      // Create the "Your Layers" filter buttons
      createLayerShowHideButtons(id);

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

      initialiseLayerButtons();
  });

  function createPopup(e, propertyKeys) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = propertyKeys
      .map(
        (propertyKey) =>
          `<strong>${propertyKey}:</strong> ${e.features[0].properties[propertyKey]}`
      )
      .join("<br>");

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
  }

  for (const [layer, layerData] of Object.entries(mapLayers)) {
    if (
      Array.isArray(layerData.metadata.popup_properties) &&
      layerData.metadata.popup_properties.length > 0
    ) {
      const propertyKeys = layerData.metadata.popup_properties;
      map.on("click", layer, function (e) {
        createPopup(e, propertyKeys);
      });
    }
  }

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

  // map.addControl(
  //   new MaplibreLegendControl(legendLayers, {
  //     showDefault: false,
  //     showCheckbox: true,
  //     onlyRendered: true,
  //     reverseOrder: true,
  //   }),
  //   "bottom-right"
  // );

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

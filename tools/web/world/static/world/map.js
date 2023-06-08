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

// This is a temporary object to set up the initial map layers to display on the "Your Layers" section.  Not strictly necessary but may be useful for demos.
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

// Remember which layers are displayed in "Your Layers" section
let DisplayedLayers = JSON.parse(localStorage.getItem('DisplayedLayers')) || defaultDisplayedLayers; // Retrieve DisplayedLayers from localStorage

function getCategories(mapLayers) {
  let categories = new Set();
  for (const layer in mapLayers) {
    console.log("layer", layer)
    console.log("mapLayers[layer]", mapLayers[layer])
    categories.add(mapLayers[layer]["metadata"]["category"]);
  }
  return categories;
}

async function create_yourLayerButtons(id, DisplayedLayers, mapLayers, map) {
  let element = document.getElementById("yourLayers_container");
  let dataUrl = element.getAttribute('data-url');
  console.log(dataUrl); // Prints the value of data-url
  console.log("this id", id); // Prints the value of data-url

  if (DisplayedLayers.includes(id)) {
    
    // Create URL object
    let url = new URL(window.location.origin + dataUrl);
    url.searchParams.append('id', id);
    url.searchParams.append('type','yourLayers')
  
    // Make the request
    return fetch(url)
      .then(response => response.json())
      .then(data => {
        const yourLayers = document.getElementById("yourLayers_container");
        
        // Create a temporary container and append the HTML to it
        let tempContainer = document.createElement('div');
        tempContainer.innerHTML = data.html;
  
        // Get the first (and only) child node of the container (this is your new HTML)
        let newElement = tempContainer.firstElementChild;

        // Select the layer-description p tag and replace its content
        let summaryParagraph = newElement.querySelector('.layer-description-summary');
        let detailedParagraph = newElement.querySelector('.layer-description-detail');
        summaryParagraph.innerText= mapLayers[id]["metadata"]["summary_description"];
        detailedParagraph.innerText= mapLayers[id]["metadata"]["full_description"];
  
        // Append the new HTML to the DOM
        yourLayers.appendChild(newElement);
  
        // Extract the ID from the new element's data-id attribute
        const elementId = newElement.getAttribute('data-id');
  
        // Attach event listeners.

        const activateLayers = newElement.querySelectorAll('.activateLayer');
        activateLayers.forEach(function(element) {
            element.addEventListener('click', function(e) {
                const clickedLayer = elementId;
                console.log("clickedLayer", clickedLayer)
                e.preventDefault();
                e.stopPropagation();
                console.log("map.getLayer(clickedLayer)", map.getLayer(clickedLayer))

                if (!map.getLayer(clickedLayer)) {
                  // Display layer on the map if not currently visible
                  mapLayers[clickedLayer].id = clickedLayer;
                  map.addLayer(mapLayers[clickedLayer]);
                }

                let parentListElement = this.closest('li');
                let switchBtn = parentListElement.querySelector('input[type="checkbox"]');

                const visibility = map.getLayoutProperty(clickedLayer, "visibility");

                // Toggle layer visibility by changing the layout object's visibility property.
                if (visibility === "visible") {
                  map.setLayoutProperty(clickedLayer, "visibility", "none");
                  this.classList.remove("active");
                  switchBtn.checked = false;

                } else {
                  this.classList.add("active");
                  map.setLayoutProperty(clickedLayer, "visibility", "visible");
                  switchBtn.checked = true;
                }
            });
        });
      })
      .catch(err => {
        console.error('Error:', err);
      });
  };
};

async function update_yourLayerButtons(DisplayedLayers, mapLayers, map) {
  // Get container of yourLayers
  const yourLayers = document.getElementById('yourLayers_container');

  // Clear all current toggles
  yourLayers.innerHTML = '';

  // Enumerate ids of the layers.
  const toggleableLayerIds = Object.keys(mapLayers).sort();
  console.log("map layers object", toggleableLayerIds)

  // Set up the corresponding your layer button for each layer.
  const promises = toggleableLayerIds.map(id => create_yourLayerButtons(id, DisplayedLayers, mapLayers, map));

  // Await all the promises to be resolved. This ensures all buttons are created before moving forward.
  await Promise.all(promises);
}

function sort_yourLayerButtons() {
  const container = document.getElementById('yourLayers_container');
  Array.from(container.children)
    .sort((a, b) => a.textContent.localeCompare(b.textContent))
    .forEach(button => container.appendChild(button));
}

async function create_addLayerCategories(layerCategories) {
  
  let addLayer_container = document.getElementById("addLayers-container");
  let dataUrl = addLayer_container.getAttribute('data-url');

  for (let category of layerCategories) {
    let categoryID_withoutSpaces = category.replace(/\s+/g, '');

    // Create URL objects for  category
    let urlCategory = new URL(window.location.origin + dataUrl);
    urlCategory.searchParams.append('type', 'addLayers-Category');
    urlCategory.searchParams.append('categoryID', categoryID_withoutSpaces);
    urlCategory.searchParams.append('category', category);

    try {
      let categoryResponse = await fetch(urlCategory);
      let categoryData = await categoryResponse.json();

      // Create a temporary container and append the HTML to it
      let tempContainer = document.createElement('div');
      tempContainer.innerHTML = categoryData.html;

      // Get the first (and only) child node of the container (this is your new HTML)
      let newCategory_Button = tempContainer.firstElementChild;

      // Append the new HTML to the DOM
      addLayer_container.appendChild(newCategory_Button);

    } catch (err) {
      console.error('Error in create_addLayersButtons:', err);
    }
  };
  // categories.add(category);
};


async function create_addLayerButtons(id, mapLayers, DisplayedLayers) {
  
  let addLayer_container = document.getElementById("addLayers-container");
  let dataUrl = addLayer_container.getAttribute('data-url');

  // Get category and add it to the set
  let category = mapLayers[id]["metadata"]["category"];
  let categoryID_withoutSpaces = category.replace(/\s+/g, '');
  // categories.add(category);

  // Create URL objects for button and category
  let urlButton = new URL(window.location.origin + dataUrl);
  urlButton.searchParams.append('type', 'addLayers');
  urlButton.searchParams.append('id', id);

  try {
    // Fetch the Add Layer Button html
    let buttonResponse = await fetch(urlButton);
    let buttonData = await buttonResponse.json();

    console.log("buttonData", buttonData)

    // Create a temporary container and append the HTML to it
    let tempContainer = document.createElement('div');
    tempContainer.innerHTML = buttonData.html;

    // Get the first (and only) child node of the container
    let addLayer_button = tempContainer.firstElementChild;

    console.log("addLayer_button", addLayer_button)

    // Select the layer-description p tag and replace its content
    let summaryParagraph = addLayer_button.querySelector('.layer-description-summary');
    summaryParagraph.innerText= mapLayers[id]["metadata"]["summary_description"];

    if (DisplayedLayers.includes(id)) {
      // If it is, set the button to 'on' state
      addLayer_button.dataset.state = 'on';
    } else {
      // If it's not, set the button to 'off' state
      addLayer_button.dataset.state = 'off';
    }

    // // Get correct category div (or create it if it does not yet exist)
    let categoryButton = document.getElementById(categoryID_withoutSpaces);

    categoryButton.appendChild(addLayer_button);

    // Set CSS to indicate whether layer is currently in Your Layers
    set_add_layers_btn(addLayer_button);

  } catch (err) {
    console.error('Error in create_addLayersButtons:', err);
  }
};

function addCategoryToDropdown(category) {
  let dropdownMenu = document.getElementById("menuItems");

  let dropdownItem = document.createElement("a");
  dropdownItem.href = "#";
  dropdownItem.id = "link" + category.replace(/\s+/g, '');
  dropdownItem.className = "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100";
  dropdownItem.textContent = category;

  dropdownItem.onclick = function(event) {
    event.preventDefault();
    // Scroll to the category in the sidebar
    let category_div = document.getElementById(category.replace(/\s+/g, ''));
    console.log("category_div clicked", category_div)
    category_div.scrollIntoView({behavior: "smooth"});
  };
  dropdownMenu.appendChild(dropdownItem);
}

function set_add_layers_btn(addLayers_btn){
  if (addLayers_btn.dataset.state === 'on') {
    addLayers_btn.classList.add('border-[#00ffda]', 'border-t-[#00aa95]', 'border-l-[#00aa95]', 'bg-neutral-100');
  } else {
    addLayers_btn.classList.remove('border-[#00ffda]', 'border-t-[#00aa95]', 'border-l-[#00aa95]', 'bg-neutral-100');
  }
  localStorage.setItem('DisplayedLayers', JSON.stringify(DisplayedLayers)); // Save DisplayedLayers to localStorage
}

function toggle_add_layers_btn(addlayers_btn) {
  if (addlayers_btn.dataset.state === 'off') {
    DisplayedLayers.push(addlayers_btn.dataset.layerId);
    addlayers_btn.dataset.state = 'on';
    set_add_layers_btn(addlayers_btn);

  } else {
    DisplayedLayers = DisplayedLayers.filter(id => id !== addlayers_btn.dataset.layerId);
    addlayers_btn.dataset.state = 'off';
    set_add_layers_btn(addlayers_btn);
  }
  localStorage.setItem('DisplayedLayers', JSON.stringify(DisplayedLayers)); // Save DisplayedLayers to localStorage
}

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

  let layerCategories = getCategories(mapLayers);
  console.log("layerCategories", layerCategories)
  create_addLayerCategories(layerCategories);

  // Create Add Layers buttons and add event listeners (to add/remove Your Layer buttons)

  document.getElementById('addLayers-container').addEventListener('click', function(e) {
    var buttonElement = e.target.closest('.layer-button');
    var categoryElement = e.target.closest('.accordion-button');

    if (buttonElement) {
      console.log("clicked to add/remove layer:", buttonElement.dataset.layerId)
      toggle_add_layers_btn(buttonElement);
    } if (categoryElement) {
      console.log("clicked to expand/collapse category:", categoryElement.dataset.categoryId)

      // CREATE ROTATE FUNCTION
      const content = categoryElement.nextElementSibling;
      console.log("content", content)
      console.log("content.scrollHeight", content.scrollHeight)
  
      if(content.style.maxHeight){
        content.style.maxHeight = null;
        content.classList.add('hidden');
      } else {
        content.classList.remove('hidden');
        content.style.maxHeight = content.scrollHeight + "px";
        
      }
      rotateImage(categoryElement);


    }  else {
      console.log ("no match", e.target)
    }

    update_yourLayerButtons(DisplayedLayers, mapLayers, map).then(() => {
      sort_yourLayerButtons();
    }).catch(error => console.error('Error:', error)); 
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

    // Create array of promises
    let promises = [];

    // Set up the corresponding toggle button for each layer.
    for (const id of toggleableLayerIds) {
      // Skip layers that already have a button set up.
      if (document.getElementById(id)) {
        continue;
      }

      // >>>OLD LAYER CONTROL CODE TO DELETE<<<

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

      // >>>END OLD LAYER CONTROL CODE<<<

      // Create the Add Layers buttons

      create_addLayerButtons(id, mapLayers, DisplayedLayers)

      // Create the "Your Layers" filter buttons

      promises.push(create_yourLayerButtons(id, DisplayedLayers, mapLayers, map));
    }

    Promise.all(promises).then(() => {
      sort_yourLayerButtons();
    });

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

      // Clear the dropdown menu once before adding categories
    let dropdownMenu = document.getElementById("menuItems");
    dropdownMenu.innerHTML = '';

    // After the "idle" event, populate the dropdown menu with the categories
      layerCategories.forEach(category => addCategoryToDropdown(category));

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



// YourLayers Accordion Button

document.getElementById('yourLayers_container').addEventListener('click', function(event) {
  console.log("event.target!", event.target)

  let button = event.target.closest('button') || event.target.previousElementSibling;

  if (!button) {
      let popover = event.target.closest('.popover');
      if (popover) {
          button = popover.previousElementSibling;
      }
  }

  // let button = event.target.closest('button') || event.target.previousElementSibling || event.target.closest('.popover').previousElementSibling;

  if (button) {
    if (button.matches('.accordion-button')) {
      console.log("accordion matched")
      const content = button.nextElementSibling;

      if(content.style.maxHeight){
        content.style.maxHeight = null;
        content.classList.add('hidden');
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
        content.classList.remove('hidden');
      }

      rotateImage(button);

    } else if(button.matches('.key')){
      console.log("key matched")
      const popover = button.nextElementSibling;
    
      if (popover.classList.contains('hidden')) {
        popover.classList.remove('hidden');
      } else {
        popover.classList.add('hidden');
      }
    } else if (button.matches('.remove-yourLayerButton')) {
      console.log("remove button clicked")

      let yourLayerButton = button.closest('li');

      let matchingAddLayerButton = document.querySelector(`#addLayers-container [data-layer-id="${yourLayerButton.dataset.id}"]`);

      console.log("matchingAddLayerButton", matchingAddLayerButton)
      console.log("yourLayerButton", yourLayerButton)

      removeYourLayerButton(matchingAddLayerButton, yourLayerButton);

    } else {
      console.log ("accordion not matched")
      console.log("button", button)
    }
  } else {

    console.log ("no match", event.target)
    
  }
});

async function removeYourLayerButton(matchingAddLayerButton, yourLayerButton){
  toggle_add_layers_btn(matchingAddLayerButton);
    let mapLayers =  await fetchMapLayers();

    update_yourLayerButtons(DisplayedLayers, mapLayers, map).then(() => {
      sort_yourLayerButtons();
    }).catch(error => console.error('Error:', error));
}





        // const elementId = newElement.getAttribute('data-id');
  
        // // Attach event listeners.

        // const activateLayers = newElement.querySelectorAll('.activateLayer');
        // activateLayers.forEach(function(element) {
        //     element.addEventListener('click', function(e) {
        //         const clickedLayer = elementId;
        //         console.log("clickedLayer", clickedLayer)
        //         e.preventDefault();
        //         e.stopPropagation();
        //         console.log("map.getLayer(clickedLayer)", map.getLayer(clickedLayer))

        //         if (!map.getLayer(clickedLayer)) {
        //           // Display layer on the map if not currently visible
        //           mapLayers[clickedLayer].id = clickedLayer;
        //           map.addLayer(mapLayers[clickedLayer]);
        //         }

        //         let parentListElement = this.closest('li');
        //         let switchBtn = parentListElement.querySelector('input[type="checkbox"]');

        //         const visibility = map.getLayoutProperty(clickedLayer, "visibility");

        //         // Toggle layer visibility by changing the layout object's visibility property.
        //         if (visibility === "visible") {
        //           map.setLayoutProperty(clickedLayer, "visibility", "none");
        //           this.classList.remove("active");
        //           switchBtn.checked = false;

        //         } else {
        //           this.classList.add("active");
        //           map.setLayoutProperty(clickedLayer, "visibility", "visible");
        //           switchBtn.checked = true;
        //         }
        //     });
        // });
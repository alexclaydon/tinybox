import { LayerToggleControl, ModeSwitchControl } from "./controls.js";
import { fetchMapSources, fetchMapLayers, fetchMapStyle } from "./features.js";
import {
    getLayerCategories,
    create_yourLayerButtons,
    update_yourLayerButtons,
    sort_yourLayerButtons,
    create_addLayerCategories,
    create_addLayerButtons,
    addCategoryToDropdown,
    toggle_add_layers_btn,
    initialiseLayerButtons,
    rotateImage,
} from "./layersPanel.js";

// #TODO: Import API keys: To be confirmed whether this is actually secure
const mapbox_api_key = JSON.parse(
    document.getElementById("mapbox_api_key").textContent
);

const stadiaMapsApiKey = JSON.parse(
    document.getElementById("stadia_maps_api_key").textContent
);

if (!maplibregl.supported()) {
    alert("Your browser does not support MapLibre GL");
}

// Temporary object to set up initial display layers.  Production would fetch this from the database.
let defaultDisplayedLayers = [
    "Average annual traffic volume",
    "Future land development",
    "Areas within walking distance (400m) of public space",
    "Open spaces",
    "CBD bike routes",
    "Crime rate (per 100k ppl)",
    "School locations",
];

// Retrieve DisplayedLayers from localStorage, or use defaultDisplayedLayers if it doesn't exist
let DisplayedLayers =
    JSON.parse(localStorage.getItem("DisplayedLayers")) ||
    defaultDisplayedLayers;
console.log("Displayed Layers: ", DisplayedLayers);

// <!--Category Drop Down-->

let isDropdownOpen = false;

document
    .getElementById("menuButton")
    .addEventListener("click", function (event) {
        event.stopPropagation(); // Prevent this click event from bubbling up to the document
        document.getElementById("menuItems").classList.toggle("hidden");
        isDropdownOpen = !isDropdownOpen;
    });

document.addEventListener("click", function () {
    if (isDropdownOpen) {
        document.getElementById("menuItems").classList.add("hidden");
        isDropdownOpen = false;
    }
});

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

    function getStyleByMode(mode) {
        return mode == "dark" ? lightStyle : lightStyle;
    }

    const mapSources = await fetchMapSources();
    console.log("Map Sources: ", mapSources);

    const mapLayers = await fetchMapLayers();
    console.log("Map Layers: ", mapLayers);

    const map = new maplibregl.Map({
        container: "map",
        center: [144.946457, -37.840935], // Initial focus coordinate (long, lat)
        zoom: 8,
        style: getStyleByMode(activeMode),
        attributionControl: false,
    });
    console.log("Map: ", map);

    let layerCategories = getLayerCategories(mapLayers);
    console.log("Layer Categories: ", layerCategories);
    create_addLayerCategories(layerCategories);

    document
        .getElementById("addLayers-container")
        .addEventListener("click", function (e) {
            var buttonElement = e.target.closest(".layer-button");
            var categoryElement = e.target.closest(".accordion-button");

            if (buttonElement) {
                console.log(
                    "clicked to add/remove layer:",
                    buttonElement.dataset.layerId
                );
                toggle_add_layers_btn(buttonElement);
            }
            if (categoryElement) {
                console.log(
                    "clicked to expand/collapse category:",
                    categoryElement.dataset.categoryId
                );

                const content = categoryElement.nextElementSibling;
                console.log("content", content);
                console.log("content.scrollHeight", content.scrollHeight);

                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                    content.classList.add("hidden");
                } else {
                    content.classList.remove("hidden");
                    content.style.maxHeight = content.scrollHeight + "px";
                }
                rotateImage(categoryElement);
            } else {
                console.log("no match", e.target);
            }

            update_yourLayerButtons(DisplayedLayers, mapLayers, map)
                .then(() => {
                    sort_yourLayerButtons();
                })
                .catch((error) => console.error("Error:", error));
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

            console.log(
                "Successfully added vector source and layer information"
            );
        } catch (error) {
            console.error(
                "An error occurred while adding vector source and layers:",
                error
            );
        }

        const toggleableLayerIds = Object.keys(mapLayers);
        let promises = [];

        for (const id of toggleableLayerIds) {
            // Skip layers that already have a button set up.
            if (document.getElementById(id)) {
                continue;
            }

            create_addLayerButtons(id, mapLayers, DisplayedLayers);

            // Create the "Your Layers" filter buttons

            promises.push(
                create_yourLayerButtons(id, DisplayedLayers, mapLayers, map)
            );
        }

        Promise.all(promises).then(() => {
            sort_yourLayerButtons();
        });
    });

    map.on("idle", () => {
        // Enumerate ids of the layers.
        const toggleableLayerIds = Object.keys(mapLayers);
        let promises = [];

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
                            map.setLayoutProperty(
                                layer,
                                "visibility",
                                "visible"
                            );
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
        dropdownMenu.innerHTML = "";

        // After the "idle" event, populate the dropdown menu with the categories
        layerCategories.forEach((category) => addCategoryToDropdown(category));
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

    // // Get references to the search input and button
    // const searchInput = document.getElementById("search-input");
    // const searchButton = document.getElementById("search-button");

    // // Add an event listener to the search button
    // searchButton.addEventListener("click", () => {
    //   // Get the search query from the input field
    //   const query = searchInput.value;

    //   // Use the geocoder to search for the query
    //   geocoder.query(query);
    // });

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

    map.addControl(new ModeSwitchControl(), "bottom-left");
})();

// <!--Slider-->

document.getElementById("SlideX").addEventListener("click", function () {
    var wrapper = document.getElementById("slidingDiv");
    if (wrapper.style.transform === "translateX(-100%)") {
        wrapper.style.transform = "";
    } else {
        wrapper.style.transform = "translateX(-100%)";
    }
});
document.getElementById("SlideY").addEventListener("click", function () {
    var wrapper = document.getElementById("slidingDiv");
    if (wrapper.style.transform === "translateY(100%)") {
        wrapper.style.transform = "";
    } else {
        wrapper.style.transform = "translateY(100%)";
    }
});

// <!--Flip slide buttons-->

let rotateY = false;
let rotateX = false;

document.getElementById("SlideY").addEventListener("click", function () {
    var button = document.getElementById("btnFlipY");
    rotateY = !rotateY; // toggles the rotation state
    button.style.transform = rotateY ? "rotate(180deg)" : ""; // apply rotation
    let container = document.getElementById("sidebar-container");
    if (container.classList.contains("overflow-y-scroll")) {
        container.classList.remove("overflow-y-scroll");
    } else {
        container.classList.add("overflow-y-scroll");
    }
});

document.getElementById("SlideX").addEventListener("click", function () {
    var button = document.getElementById("btnFlipX");
    rotateX = !rotateX; // toggles the rotation state
    button.style.transform = rotateX ? "rotate(180deg)" : ""; // apply rotation
});

const tab1Button = document.getElementById("tab1-button");
const tab2Button = document.getElementById("tab2-button");
const tab1Content = document.getElementById("tab1-content");
const tab2Content = document.getElementById("tab2-content");

function switchTab(
    activeButton,
    inactiveButton,
    activeContent,
    inactiveContent
) {
    activeButton.classList.add(
        "border-b-2",
        "border-[#00aa95]",
        "text-[#00aa95]"
    );
    inactiveButton.classList.remove(
        "border-b-2",
        "border-[#00aa95]",
        "text-[#00aa95]"
    );

    activeContent.classList.remove("hidden");
    inactiveContent.classList.add("hidden");
}

tab1Button.addEventListener("click", () => {
    switchTab(tab1Button, tab2Button, tab1Content, tab2Content);
});

tab2Button.addEventListener("click", () => {
    switchTab(tab2Button, tab1Button, tab2Content, tab1Content);
});

// Select tab1Button on page load
switchTab(tab1Button, tab2Button, tab1Content, tab2Content);

// `switchTabs` doesn't appear to be used - was refactored into `switchTab`?

// function switchTabs(tab) {
//   tab1Button.classList.remove(
//     "border-[#00aa95]",
//     "text-[#00aa95]",
//     "font-semibold"
//   );
//   tab1Button.classList.add(
//     "border-transparent",
//     "text-neutral-400",
//     "hover:text-neutral-600",
//     "hover:border-neutral-600"
//   );

//   tab2Button.classList.remove(
//     "border-[#00aa95]",
//     "text-[#00aa95]",
//     "font-semibold"
//   );
//   tab2Button.classList.add(
//     "border-transparent",
//     "text-neutral-400",
//     "hover:text-neutral-600",
//     "hover:border-neutral-600"
//   );

//   document
//     .getElementById(tab + "-button")
//     .classList.add(
//       "border-b-2",
//       "border-[#00aa95]",
//       "text-[#00aa95]",
//       "font-semibold"
//     );
//   document
//     .getElementById(tab + "-button")
//     .classList.remove(
//       "border-transparent",
//       "text-neutral-400",
//       "hover:text-neutral-600",
//       "hover:border-neutral-600"
//     );
// }

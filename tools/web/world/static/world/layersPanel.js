const spaces_api_key = JSON.parse(
    document.getElementById("spaces_api_key").textContent
);

const spaces_api_secret = JSON.parse(
    document.getElementById("spaces_api_secret").textContent
);

const spaces_cdn_endpoint = JSON.parse(
    document.getElementById("spaces_cdn_endpoint").textContent
);

// Layer Panel Categories Dropdown

export function getLayerCategories(mapLayers) {
    let categories = new Set();
    for (const layer in mapLayers) {
        categories.add(mapLayers[layer]["metadata"]["category"]);
    }
    return categories;
}

export function addCategoryToDropdown(category) {
    let dropdownMenu = document.getElementById("menuItems");

    let dropdownItem = document.createElement("a");
    dropdownItem.href = "#";
    dropdownItem.id = "link" + category.replace(/\s+/g, "");
    dropdownItem.className =
        "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100";
    dropdownItem.textContent = category;

    dropdownItem.onclick = function (event) {
        event.preventDefault();
        document.getElementById("menuItems").classList.add("hidden");
        isDropdownOpen = false;

        // dropdownItem.onclick = function(event) {
        //   event.stopPropagation(); // Prevent this click event from bubbling up to the document

        //   event.preventDefault();
        // Scroll to the category in the sidebar
        let category_div = document.getElementById(
            category.replace(/\s+/g, "")
        );
        console.log("category_div clicked", category_div);
        category_div.scrollIntoView({ behavior: "smooth" });
    };
    dropdownMenu.appendChild(dropdownItem);
}

// Layer Panel Layer Buttons

// Initialize buttons on page load
export function initialiseLayerButtons() {
    document.querySelectorAll(".layer-button").forEach((button) => {
        // Check if button's layerId is in DisplayedLayers
        if (DisplayedLayers.includes(button.dataset.layerId)) {
            // If it is, set the button to 'on' state
            button.dataset.state = "on";
            button.classList.add(
                "border-[#00ffda]",
                "border-t-[#00aa95]",
                "border-l-[#00aa95]",
                "bg-neutral-100"
            );
        } else {
            // If it's not, set the button to 'off' state
            button.dataset.state = "off";
            button.classList.remove(
                "border-[#00ffda]",
                "border-t-[#00aa95]",
                "border-l-[#00aa95]",
                "bg-neutral-100"
            );
        }
    });
}

export function toggle_add_layers_btn(addlayers_btn) {
    if (addlayers_btn.dataset.state === "off") {
        DisplayedLayers.push(addlayers_btn.dataset.layerId);
        addlayers_btn.dataset.state = "on";
        set_add_layers_btn(addlayers_btn);
    } else {
        DisplayedLayers = DisplayedLayers.filter(
            (id) => id !== addlayers_btn.dataset.layerId
        );
        addlayers_btn.dataset.state = "off";
        set_add_layers_btn(addlayers_btn);
    }
    localStorage.setItem("DisplayedLayers", JSON.stringify(DisplayedLayers)); // Save DisplayedLayers to localStorage
}

function set_add_layers_btn(addLayers_btn) {
    if (addLayers_btn.dataset.state === "on") {
        addLayers_btn.classList.add(
            "border-[#00ffda]",
            "border-t-[#00aa95]",
            "border-l-[#00aa95]",
            "bg-neutral-100"
        );
    } else {
        addLayers_btn.classList.remove(
            "border-[#00ffda]",
            "border-t-[#00aa95]",
            "border-l-[#00aa95]",
            "bg-neutral-100"
        );
    }
    localStorage.setItem("DisplayedLayers", JSON.stringify(DisplayedLayers)); // Save DisplayedLayers to localStorage
}

export async function create_addLayerButtons(id, mapLayers, DisplayedLayers) {
    let addLayer_container = document.getElementById("addLayers-container");
    let dataUrl = addLayer_container.getAttribute("data-url");

    // Get category and add it to the set
    let category = mapLayers[id]["metadata"]["category"];
    let categoryID_withoutSpaces = category.replace(/\s+/g, "");
    // categories.add(category);

    // Create URL objects for button and category
    let urlButton = new URL(window.location.origin + dataUrl);
    urlButton.searchParams.append("type", "addLayers");
    urlButton.searchParams.append("id", id);

    try {
        // Fetch the Add Layer Button html
        let buttonResponse = await fetch(urlButton);
        let buttonData = await buttonResponse.json();

        // Create a temporary container and append the HTML to it
        let tempContainer = document.createElement("div");
        tempContainer.innerHTML = buttonData.html;

        // Get the first (and only) child node of the container
        let addLayer_button = tempContainer.firstElementChild;

        // Select the layer-description p tag and replace its content
        let summaryParagraph = addLayer_button.querySelector(
            ".layer-description-summary"
        );
        summaryParagraph.innerText =
            mapLayers[id]["metadata"]["summary_description"];

        if (DisplayedLayers.includes(id)) {
            // If it is, set the button to 'on' state
            addLayer_button.dataset.state = "on";
        } else {
            // If it's not, set the button to 'off' state
            addLayer_button.dataset.state = "off";
        }

        // // Get correct category div (or create it if it does not yet exist)
        let categoryButton = document.getElementById(categoryID_withoutSpaces);

        categoryButton.appendChild(addLayer_button);

        // Set CSS to indicate whether layer is currently in Your Layers
        set_add_layers_btn(addLayer_button);
    } catch (err) {
        console.error("Error in create_addLayersButtons:", err);
    }
}

export async function create_addLayerCategories(layerCategories) {
    let addLayer_container = document.getElementById("addLayers-container");
    let dataUrl = addLayer_container.getAttribute("data-url");

    for (let category of layerCategories) {
        let categoryID_withoutSpaces = category.replace(/\s+/g, "");

        // Create URL objects for  category
        let urlCategory = new URL(window.location.origin + dataUrl);
        urlCategory.searchParams.append("type", "addLayers-Category");
        urlCategory.searchParams.append("categoryID", categoryID_withoutSpaces);
        urlCategory.searchParams.append("category", category);

        try {
            let categoryResponse = await fetch(urlCategory);
            let categoryData = await categoryResponse.json();

            // Create a temporary container and append the HTML to it
            let tempContainer = document.createElement("div");
            tempContainer.innerHTML = categoryData.html;

            let newCategory_Button = tempContainer.firstElementChild;
            addLayer_container.appendChild(newCategory_Button);
        } catch (err) {
            console.error("Error in create_addLayersButtons:", err);
        }
    }
}

export async function update_yourLayerButtons(DisplayedLayers, mapLayers, map) {
    const yourLayers = document.getElementById("yourLayers_container");
    yourLayers.innerHTML = "";
    const toggleableLayerIds = Object.keys(mapLayers).sort();
    console.log("map layers object", toggleableLayerIds);

    // Set up the corresponding your layer button for each layer.
    const promises = toggleableLayerIds.map((id) =>
        create_yourLayerButtons(id, DisplayedLayers, mapLayers, map)
    );

    await Promise.all(promises);
}

export function sort_yourLayerButtons() {
    const container = document.getElementById("yourLayers_container");
    Array.from(container.children)
        .sort((a, b) => a.textContent.localeCompare(b.textContent))
        .forEach((button) => container.appendChild(button));
}

export async function create_yourLayerButtons(
    id,
    DisplayedLayers,
    mapLayers,
    map
) {
    let element = document.getElementById("yourLayers_container");
    let dataUrl = element.getAttribute("data-url");

    if (DisplayedLayers.includes(id)) {
        // Create URL object
        let url = new URL(window.location.origin + dataUrl);
        url.searchParams.append("id", id);
        url.searchParams.append("type", "yourLayers");

        // Make the request
        return fetch(url)
            .then((response) => response.json())
            .then((data) => {
                const yourLayers = document.getElementById(
                    "yourLayers_container"
                );

                // Create a temporary container and append the HTML to it
                let tempContainer = document.createElement("div");
                tempContainer.innerHTML = data.html;

                // Get the first (and only) child node of the container (this is your new HTML)
                let newElement = tempContainer.firstElementChild;

                // Select the layer-description p tag and replace its content
                let summaryParagraph = newElement.querySelector(
                    ".layer-description-summary"
                );
                let detailedParagraph = newElement.querySelector(
                    ".layer-description-detail"
                );
                summaryParagraph.innerText =
                    mapLayers[id]["metadata"]["summary_description"];
                detailedParagraph.innerText =
                    mapLayers[id]["metadata"]["full_description"];

                yourLayers.appendChild(newElement);
                attachYourLayerEventListeners(newElement, map, mapLayers);

                //set button visibility
                setLayerVisibilityButton(
                    newElement.querySelector('input[type="checkbox"]'),
                    id,
                    map,
                    mapLayers
                );
            })
            .catch((err) => {
                console.error("Error:", err);
            });
    }
}

function attachYourLayerEventListeners(newElement, map, mapLayers) {
    const accordionButton = newElement.querySelector(".accordion-button");
    const keyButton = newElement.querySelector(".key");
    const popOver = newElement.querySelector(".layer-description-detail");
    const removeButton = newElement.querySelector(".remove-yourLayerButton");
    const switchBtn = newElement.querySelector('input[type="checkbox"]');

    const elementId = newElement.getAttribute("data-id");

    accordionButton.addEventListener("click", function (e) {
        toggleAccordion(accordionButton);
    });

    keyButton.addEventListener("click", function (e) {
        e.stopPropagation();
        togglePopover(keyButton);
    });

    popOver.addEventListener("click", function (e) {
        console.log("clicked popover");
        togglePopover(keyButton);
    });

    removeButton.addEventListener("click", function (e) {
        console.log("removing element");
        console.log("mapLayers", mapLayers);
        removeYourLayerButton(elementId, mapLayers, map);
    });

    switchBtn.addEventListener("click", function (e) {
        toggleLayerVisibility(switchBtn, elementId, map, mapLayers);
    });

    newElement.addEventListener("click", function (e) {
        // If clicked target is not any of the buttons
        if (
            !e.target.closest(".key") &&
            !e.target.closest(".remove-yourLayerButton") &&
            !e.target.closest(".accordion-button") &&
            !e.target.closest(".layer-description-detail")
        ) {
            toggleLayerVisibility(switchBtn, elementId, map, mapLayers);
        }
    });
}

function setLayerVisibilityButton(switchBtn, clickedLayer, map, mapLayers) {
    const visibility = map.getLayoutProperty(clickedLayer, "visibility");

    if (visibility === "visible") {
        switchBtn.checked = true;
    } else {
        switchBtn.checked = false;
    }
}

function toggleLayerVisibility(switchBtn, clickedLayer, map, mapLayers) {
    // Prevent action if layer does not exist in the map.
    if (!map.getLayer(clickedLayer)) {
        // Display layer on the map if not currently visible
        mapLayers[clickedLayer].id = clickedLayer;
        map.addLayer(mapLayers[clickedLayer]);
    }

    const visibility = map.getLayoutProperty(clickedLayer, "visibility");

    // Toggle layer visibility by changing the layout object's visibility property.
    if (visibility === "visible") {
        map.setLayoutProperty(clickedLayer, "visibility", "none");
        switchBtn.checked = false;
    } else {
        map.setLayoutProperty(clickedLayer, "visibility", "visible");
        switchBtn.checked = true;
    }
}

function toggleAccordion(button) {
    const content = button.nextElementSibling;
    if (content.style.maxHeight) {
        content.style.maxHeight = null;
        content.classList.add("hidden");
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
        content.classList.remove("hidden");
    }
    rotateImage(button); // assuming this function is already defined in your existing code
}

function togglePopover(button) {
    const popover = button.nextElementSibling;
    // Stop propagation so that document-level click handler doesn't immediately hide the popover
    // e.stopPropagation();

    if (popover.classList.contains("hidden")) {
        popover.classList.remove("hidden");
        // Add an event listener to the document which will hide the popover
        // on the next click anywhere in the document
        document.addEventListener("click", function hidePopover(event) {
            // Remove the event listener itself to avoid stacking up event listeners
            document.removeEventListener("click", hidePopover);
            // Hide the popover
            popover.classList.add("hidden");
            event.stopPropagation();
        });
    }
}

export function rotateImage(button) {
    // Find the image element relative to the button
    const imgElement = button.querySelector(".btnTwistie");
    if (imgElement.classList.contains("rotate-90")) {
        imgElement.classList.remove("rotate-90");
    } else {
        imgElement.classList.add("rotate-90");
    }
}

function removeYourLayerButton(id, mapLayers, map) {
    let matchingAddLayerButton = document.querySelector(
        `#addLayers-container [data-layer-id="${id}"]`
    );

    toggle_add_layers_btn(matchingAddLayerButton);

    update_yourLayerButtons(DisplayedLayers, mapLayers, map)
        .then(() => {
            sort_yourLayerButtons();
        })
        .catch((error) => console.error("Error:", error));
}

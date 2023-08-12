export function getLayerCategories(mapLayers) {
    let categories = new Set();
    for (const layer in mapLayers) {
        categories.add(mapLayers[layer]["metadata"]["category"]);
    }
    return Array.from(categories);
}

// Layer Panel Layer Buttons

// Initialize buttons on page load
export function initialiseLayerButtons() {
    let DisplayedLayers = JSON.parse(localStorage.getItem("DisplayedLayers"));

    document.querySelectorAll(".layer-button").forEach((button) => {
        // Check if button's layerId is in displayedLayers
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
    let DisplayedLayers = JSON.parse(localStorage.getItem("DisplayedLayers"));

    let updatedLayers;

    if (addlayers_btn.dataset.state === "off") {
        updatedLayers = [...DisplayedLayers, addlayers_btn.dataset.layerId];
        addlayers_btn.dataset.state = "on";
        addlayers_btn.classList.add(
            "border-[#00ffda]",
            "border-t-[#00aa95]",
            "border-l-[#00aa95]",
            "bg-neutral-100"
        );
    } else {
        updatedLayers = DisplayedLayers.filter(
            (id) => id !== addlayers_btn.dataset.layerId
        );
        addlayers_btn.dataset.state = "off";
        addlayers_btn.classList.remove(
            "border-[#00ffda]",
            "border-t-[#00aa95]",
            "border-l-[#00aa95]",
            "bg-neutral-100"
        );
    }

    localStorage.setItem("DisplayedLayers", JSON.stringify(updatedLayers));
}

export async function create_addLayerButtons(id, mapLayers) {
    let addLayer_container = document.getElementById("addLayers-container");
    let dataUrl = addLayer_container.getAttribute("data-url");

    // Get category and add it to the set
    let category = mapLayers[id]["metadata"]["category"];
    let categoryID_withoutSpaces = category.replace(/\s+/g, "");

    // Create URL objects for button and category
    let urlButton = new URL(window.location.origin + dataUrl);
    urlButton.searchParams.append("type", "addLayers");
    urlButton.searchParams.append("id", id);
    // The following can be uncommented if you suspect you've got issues with your URL formation
    // console.log("URL endpoint: " + urlButton);

    const MAX_RETRIES = 6; // Max number of retries
    let retries = 0;
    let success = false;

    let buttonData;

    while (retries < MAX_RETRIES && !success) {
        try {
            let buttonResponse = await fetch(urlButton);
            if (buttonResponse.status === 503) {
                throw new Error("503 Service Unavailable");
            }

            let buttonJson = await buttonResponse.json();

            buttonData = buttonJson.html.replace(/\\&quot;/g, '"'); // Replace encoded quotes

            success = true;
        } catch (err) {
            console.warn(
                "Error in create_addLayersButtons:",
                err,
                "For buttonData: ",
                buttonData
            );
            retries++;
            if (retries < MAX_RETRIES) {
                // Exponential backoff, wait for 2^retries * 1000 milliseconds
                await new Promise((resolve) =>
                    setTimeout(resolve, Math.pow(2, retries) * 1000)
                );
                console.log(`Retrying (${retries}/${MAX_RETRIES})...`);
            } else {
                console.error("Max retries reached. Could not fetch the data.");
                return;
            }
        }
    }

    // Process the successful response
    let tempContainer = document.createElement("div");
    tempContainer.innerHTML = buttonData;
    let addLayer_button = tempContainer.firstElementChild;

    if (addLayer_button) {
        let summaryParagraph = addLayer_button.querySelector(
            ".layer-description-summary"
        );

        if (summaryParagraph) {
            summaryParagraph.innerText =
                mapLayers[id]["metadata"]["summary_description"];
        } else {
            console.warn(
                "Could not find element with class 'layer-description-summary' in summaryParagraph: ",
                summaryParagraph,
                " in HTML: ",
                tempContainer.innerHTML
            );
        }

        let DisplayedLayers = JSON.parse(
            localStorage.getItem("DisplayedLayers")
        );

        if (DisplayedLayers.includes(id)) {
            addLayer_button.dataset.state = "on";
        } else {
            addLayer_button.dataset.state = "off";
        }

        let categoryButton = document.getElementById(categoryID_withoutSpaces);

        categoryButton.appendChild(addLayer_button);
    }
}

export function create_addLayerCategories(category) {
    return new Promise(async (resolve, reject) => {
        let addLayer_container = document.getElementById("addLayers-container");
        let dataUrl = addLayer_container.getAttribute("data-url");
        let categoryID_withoutSpaces = category.replace(/\s+/g, "");

        // Create URL objects for category
        let urlCategory = new URL(window.location.origin + dataUrl);
        urlCategory.searchParams.append("type", "addLayers-Category");
        urlCategory.searchParams.append("categoryID", categoryID_withoutSpaces);
        urlCategory.searchParams.append("category", category);

        const MAX_RETRIES = 6; // Max number of retries
        let retries = 0;
        let success = false;
        let categoryData;

        while (retries < MAX_RETRIES && !success) {
            try {
                let categoryResponse = await fetch(urlCategory);
                if (categoryResponse.status === 503) {
                    throw new Error("503 Service Unavailable");
                }
                categoryData = await categoryResponse.json();
                // let categoryDataJson = await categoryResponse.json();

                // categoryData = categoryDataJson.html.replace(/\\&quot;/g, '"'); // Replace encoded quotes

                success = true;
            } catch (err) {
                console.warn(
                    "Error in create_addLayersCategories:",
                    err,
                    "For categoryData: ",
                    categoryData
                );
                retries++;
                if (retries < MAX_RETRIES) {
                    // Exponential backoff, wait for 2^retries * 1000 milliseconds
                    await new Promise((resolve) =>
                        setTimeout(resolve, Math.pow(2, retries) * 1000)
                    );
                    console.log(`Retrying (${retries}/${MAX_RETRIES})...`);
                } else {
                    console.error(
                        "Max retries reached. Could not fetch the data."
                    );
                    reject(err);
                    return;
                }
            }
        }

        // Process the successful response
        let tempContainer = document.createElement("div");
        tempContainer.innerHTML = categoryData.html;
        let newCategory_Button = tempContainer.firstElementChild;
        addLayer_container.appendChild(newCategory_Button);

        // Resolve the promise once the button is successfully created and appended
        resolve();
    });
}

export function sort_yourLayerButtons() {
    const container = document.getElementById("yourLayers_container");
    Array.from(container.children)
        .sort((a, b) => a.textContent.localeCompare(b.textContent))
        .forEach((button) => container.appendChild(button));
}

export async function create_yourLayerButtons(id, mapLayers, map) {
    let element = document.getElementById("yourLayers_container");
    let dataUrl = element.getAttribute("data-url");

    let DisplayedLayers = JSON.parse(localStorage.getItem("DisplayedLayers"));

    if (DisplayedLayers.includes(id)) {
        // Create URL object
        let url = new URL(window.location.origin + dataUrl);
        url.searchParams.append("id", id);
        url.searchParams.append("type", "yourLayers");

        let data;

        const MAX_RETRIES = 6; // Max number of retries
        let retries = 0;
        let success = false;

        while (retries < MAX_RETRIES && !success) {
            try {
                let response = await fetch(url);
                if (response.status === 503) {
                    throw new Error("503 Service Unavailable");
                }

                data = await response.json();
                success = true;
            } catch (err) {
                console.warn("Error:", err);
                retries++;
                if (retries < MAX_RETRIES) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, Math.pow(2, retries) * 1000)
                    );
                    console.log(`Retrying (${retries}/${MAX_RETRIES})...`);
                } else {
                    console.error(
                        "Max retries reached. Could not fetch the data."
                    );
                    return;
                }
            }
        }

        const yourLayers = document.getElementById("yourLayers_container");

        let tempContainer = document.createElement("div");
        tempContainer.innerHTML = data.html;

        let newElement = tempContainer.firstElementChild;

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
        // setLayerVisibilityButton(
        //     newElement.querySelector('input[type="checkbox"]'),
        //     id,
        //     map
        // );
    }
}

function attachYourLayerEventListeners(newElement, map, mapLayers) {
    const accordionButton = newElement.querySelector(".accordion-button");
    const keyButton = newElement.querySelector(".key");
    const popOver = newElement.querySelector(".layer-description-detail");
    const removeButton = newElement.querySelector(".remove-yourLayerButton");
    const switchBtn = newElement.querySelector("input[type='checkbox']");

    const elementId = newElement.getAttribute("data-id");

    accordionButton.addEventListener("click", function (e) {
        toggleAccordion(accordionButton);
    });

    keyButton.addEventListener("click", function (e) {
        e.stopPropagation();
        togglePopover(keyButton);
    });

    popOver.addEventListener("click", function (e) {
        togglePopover(keyButton);
    });

    removeButton.addEventListener("click", function (e) {
        console.log("removing element: ", elementId);
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

// function setLayerVisibilityButton(switchBtn, clickedLayer, map) {
//     const visibility = map.getLayoutProperty(clickedLayer, "visibility");

//     if (visibility === "visible") {
//         switchBtn.checked = true;
//     } else {
//         switchBtn.checked = false;
//     }
// }

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

    update_yourLayerButtons(mapLayers, map)
        .then(() => {
            sort_yourLayerButtons();
        })
        .catch((error) => console.error("Error:", error));
}

export async function update_yourLayerButtons(mapLayers, map) {
    const yourLayers = document.getElementById("yourLayers_container");
    yourLayers.innerHTML = "";
    const toggleableLayerIds = Object.keys(mapLayers).sort();

    // Set up the corresponding your layer button for each layer.
    const promises = toggleableLayerIds.map((id) =>
        create_yourLayerButtons(id, mapLayers, map)
    );

    await Promise.all(promises);
}

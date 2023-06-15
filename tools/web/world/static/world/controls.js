// Control for toggling map layers
export class LayerToggleControl {
  onAdd(map) {
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "maplibregl-ctrl";
    this._button = document.createElement("button");
    this._button.id = "toggle-icon";
    // this._button.textContent = "Toggle Layer";
    this._button.className =
      "rounded-md bg-gray-50 p-1 shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 active:hover:bg-gray-300 outline-4";
    this._icon = document.createElement("img");
    this._icon.src = "static/world/tb_Logo.svg";
    this._icon.className = "w-8 sm:w-6 h-8 sm:h-6";

    this._button.appendChild(this._icon);
    // this._button.addEventListener("click", () => {
    //   this._button.classList.toggle("bg-gray-600");
    //   this._button.classList.toggle("clicked");
    //   document.getElementById("layers-panel").classList.toggle("hidden");
    // });
    this._container.appendChild(this._button);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

// Control for switching between dark and light map modes
export class ModeSwitchControl {
  onAdd(map) {
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "maplibregl-ctrl";

    this._button = document.createElement("button");
    this._button.id = "modeSwitch";
    this._button.textContent = "Dark / Light";
    this._button.className =
      "rounded-md bg-gray-50 p-1 shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 active:hover:bg-gray-300 outline-4";

    // this._icon = document.createElement("img");
    // this._icon.src = "static/world/tb_Logo.svg";
    // this._icon.className = "w-8 sm:w-6 h-8 sm:h-6";
    // this._button.appendChild(this._icon);

    this._container.appendChild(this._button);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

// Placeholder for future JavaScript functionality

// Named placeholder handlers for each button action
const handlers = {
  // Items toggles a dropdown with more options
  items: (btn) => {
    const dropdown = document.getElementById("items-dropdown");
    if (!dropdown) {
      console.log("Items clicked (no dropdown found)");
      return;
    }

    const isOpen = dropdown.classList.toggle("open");

    // Update accessibility attributes on the dropdown and triggering button
    dropdown.setAttribute("aria-hidden", (!isOpen).toString());
    if (btn && btn.setAttribute) {
      btn.setAttribute("aria-expanded", isOpen.toString());
    }

    // If dropdown was closed, reset the image to default
    if (!isOpen) {
      try {
        const figureImg = document.querySelector("figure.images-style img");
        if (figureImg) {
          figureImg.src = "../images/bm-ui-1.png";
        }
      } catch (e) {
        // ignore
      }
    }
  },
  workshop: () => console.log("Workshop clicked"),
  freeplay: () => console.log("Freeplay clicked"),
  currentGame: () => console.log("Current Game clicked"),
  ranked: () => console.log("Ranked clicked"),
  anonymizer: () => console.log("Anonymizer clicked"),
  misc: () => console.log("Misc clicked"),
  bindings: () => console.log("Bindings clicked"),
  plugins: () => console.log("Plugins clicked"),
  patreon: () => console.log("Patreon clicked"),
};

// Generic toggler for nested submenu items inside the items-dropdown
function toggleSubmenu(triggerEl) {
  if (!triggerEl) return;
  const submenu = triggerEl.nextElementSibling;
  if (!submenu || !submenu.classList.contains("sub-dropdown")) {
    console.log("No submenu found for", triggerEl);
    return;
  }
  const isOpen = submenu.classList.toggle("open");
  submenu.setAttribute("aria-hidden", (!isOpen).toString());
  triggerEl.setAttribute("aria-expanded", isOpen.toString());
}

function printTest() {
  console.log("test");
}

// Called when a sub-dropdown item is selected. type is e.g. 'cars', id is the item id.
function handleSelection(type, id, updateSelectedImg, updateDisplayImage) {
  // Example behavior: log and close any open dropdowns
  console.log("Selected", type, id);

  // Update the selection tracker (this will be called from DOMContentLoaded)
  if (updateDisplayImage) {
    updateDisplayImage(type, id);
  }

  // Close any open sub-dropdowns
  document.querySelectorAll(".sub-dropdown.open").forEach((sd) => {
    sd.classList.remove("open");
    sd.setAttribute("aria-hidden", "true");
  });

  // Close main items dropdown if open
  const itemsDropdown = document.getElementById("items-dropdown");
  if (itemsDropdown && itemsDropdown.classList.contains("open")) {
    itemsDropdown.classList.remove("open");
    itemsDropdown.setAttribute("aria-hidden", "true");
  }

  // Reset Items button aria-expanded if present
  const itemsBtn = document.querySelector('button[data-action="items"]');
  if (itemsBtn) itemsBtn.setAttribute("aria-expanded", "false");

  // TODO: replace the console.log above with real behavior (navigation, API call, etc.)
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Welcome to My Blog!");

  // Track current selections for Cars, Decals, and Wheels
  const selections = {
    cars: "none",
    decals: "none",
    wheels: "none",
  };

  // Update the existing image in the figure below when hovering sub-dropdown items
  const figureImg = document.querySelector("#display-image");
  const defaultImgSrc = "../images/blank-octane.png";
  let selectedImgSrc = defaultImgSrc; // Track the selected (clicked) image

  const updateSelectedImg = (newSrc) => {
    selectedImgSrc = newSrc;
  };

  // Function to build the combined image path based on selections
  const buildImagePath = () => {
    // Use selected car as base, default to octane if none
    const car = selections.cars !== "none" ? selections.cars : "octane";
    let parts = ["../images/blank-" + car];
    // Only add decal/wheels if not 'none'
    if (selections.decals !== "none") {
      parts.push(selections.decals);
    }
    if (selections.wheels !== "none") {
      parts.push(selections.wheels);
    }
    return parts.join("-") + ".png";
  };

  // Function to update the display image based on current selections
  const updateDisplayImage = (type, id) => {
    selections[type] = id;
    const newImagePath = buildImagePath();
    if (figureImg) {
      // Try the preferred path and fall back to likely alternatives if the file 404s
      const fallbacks = [newImagePath];
      // If decal is selected but wheels are 'none', try common wheel fallbacks
      if (selections.decals !== "none" && selections.wheels === "none") {
        fallbacks.push(
          `../images/blank-${selections.cars !== "none" ? selections.cars : "octane"}-${
            selections.decals
          }-wheel-one.png`
        );
        fallbacks.push(
          `../images/blank-${selections.cars !== "none" ? selections.cars : "octane"}-${
            selections.decals
          }-wheel-two.png`
        );
      }
      // Always have base car as last-resort fallback
      fallbacks.push(`../images/blank-${selections.cars !== "none" ? selections.cars : "octane"}.png`);

      trySetImageWithFallbacks(fallbacks, (finalSrc) => {
        selectedImgSrc = finalSrc;
      });
    }
  };

  // Helper: try a list of image URLs in order; call cb with the first that loads, or the last tried.
  const trySetImageWithFallbacks = (urls, cb) => {
    if (!figureImg || !urls || urls.length === 0) return;
    let idx = 0;
    const tryNext = () => {
      if (idx >= urls.length) {
        // nothing worked; set to last URL
        figureImg.src = urls[urls.length - 1];
        if (cb) cb(urls[urls.length - 1]);
        return;
      }
      const url = urls[idx];
      // Create a temporary image to probe whether it exists
      const probe = new Image();
      probe.onload = () => {
        figureImg.src = url;
        if (cb) cb(url);
      };
      probe.onerror = () => {
        idx += 1;
        tryNext();
      };
      probe.src = url;
    };
    tryNext();
  };

  // Attach handler for buttons using the data-action attribute
  document.querySelectorAll("button[data-action]").forEach((btn) => {
    // ensure buttons that toggle menus are keyboard accessible
    btn.setAttribute("aria-expanded", "false");

    btn.addEventListener("click", (e) => {
      const action = btn.dataset.action;
      // call the named handler if present (pass the button element)
      if (action && handlers[action]) {
        handlers[action](btn);
      } else {
        // Fallback: generic test log
        printTest();
      }
    });
  });

  // Attach handlers for items inside the items-dropdown (nested menus)
  document.querySelectorAll("#items-dropdown [data-action]").forEach((el) => {
    // for anchors inside the dropdown, prevent default navigation and toggle submenu
    el.addEventListener("click", (evt) => {
      evt.preventDefault();
      const action = el.dataset.action;
      if (action && handlers[action]) {
        // If a specific handler exists, call it and pass the element
        handlers[action](el);
      } else {
        // fallback: toggle submenu if present
        toggleSubmenu(el);
      }
    });
  });

  // Attach click handlers to selectable sub-dropdown items
  document.querySelectorAll(".sub-dropdown a[data-select]").forEach((a) => {
    a.addEventListener("click", (evt) => {
      evt.preventDefault();
      const type = a.dataset.select;
      const id = a.dataset.id;
      // Call selection handler and pass the updateSelectedImg callback and updateDisplayImage callback
      handleSelection(type, id, updateSelectedImg, updateDisplayImage);
    });
  });

  // When hovering a sub-item, update the image
  document.querySelectorAll(".sub-dropdown a[data-preview]").forEach((link) => {
    link.addEventListener("mouseenter", () => {
      if (figureImg) {
        // Build a preview image path based on hover + current selections
        const hoverType = link.dataset.select;
        const hoverId = link.dataset.id;
        const car = hoverType === "cars" ? hoverId : selections.cars !== "none" ? selections.cars : "octane";
        let previewParts = ["../images/blank-" + car];

        // Add current selections, replacing the hovered type
        if (hoverType === "decals" && hoverId !== "none") {
          previewParts.push(hoverId);
          if (selections.wheels !== "none") previewParts.push(selections.wheels);
        } else if (hoverType === "wheels" && hoverId !== "none") {
          if (selections.decals !== "none") previewParts.push(selections.decals);
          previewParts.push(hoverId);
        } else if (hoverType === "cars") {
          if (selections.decals !== "none") previewParts.push(selections.decals);
          if (selections.wheels !== "none") previewParts.push(selections.wheels);
        } else if (hoverType === "decals" || hoverType === "wheels") {
          // "None" selected for this type
          if (hoverType === "decals" && selections.wheels !== "none") {
            previewParts.push(selections.wheels);
          } else if (hoverType === "wheels" && selections.decals !== "none") {
            previewParts.push(selections.decals);
          }
        }

        const previewPrimary = previewParts.join("-") + ".png";
        const previewFallbacks = [previewPrimary];
        // If hovering a decal and wheels aren't set, try decal+wheel variants
        if (hoverType === "decals" && hoverId !== "none" && selections.wheels === "none") {
          previewFallbacks.push(`../images/blank-${car}-${hoverId}-wheel-one.png`);
          previewFallbacks.push(`../images/blank-${car}-${hoverId}-wheel-two.png`);
        }
        // always ensure base car available as final fallback
        previewFallbacks.push(`../images/blank-${car}.png`);

        trySetImageWithFallbacks(previewFallbacks, () => {});
      }
    });
    link.addEventListener("mouseleave", () => {
      // Reset to current selections
      if (figureImg) {
        figureImg.src = buildImagePath();
      }
    });
  });

  // Add hover behavior: open submenus when hovering over the dropdown row (pointer devices)
  document.querySelectorAll("#items-dropdown .dropdown-row").forEach((row) => {
    const trigger = row.querySelector("[data-action]");
    const submenu = row.querySelector(".sub-dropdown");
    if (!trigger || !submenu) return;

    // mouseenter: open submenu
    row.addEventListener("mouseenter", () => {
      submenu.classList.add("open");
      submenu.setAttribute("aria-hidden", "false");
      trigger.setAttribute("aria-expanded", "true");
    });

    // mouseleave: close submenu
    row.addEventListener("mouseleave", () => {
      submenu.classList.remove("open");
      submenu.setAttribute("aria-hidden", "true");
      trigger.setAttribute("aria-expanded", "false");
    });
  });
});

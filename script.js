// Core State Management
const editorState = {
    history: [],
    historyIndex: -1,
    maxHistory: 30,
    isUndoing: false,

    // Immutable default config
    defaults: {
        filters: {
            brightness: 100,
            constrast: 100, // kept typo for compatibility with existing HTML ids
            saturate: 100,
            sepia: 0,
            hueRotate: 0,
            invert: 0,
            blur: 0,
            grayscale: 0,
            opacity: 100
        },
        transform: {
            rotate: 0,
            flipX: 1,
            flipY: 1
        }
    },

    // Current active config
    config: null
}

// Initialize config with defaults
editorState.config = JSON.parse(JSON.stringify(editorState.defaults));

// DOM Elements
const imageCanvas = document.querySelector("#image-canvas")
const imageInput = document.querySelector("#image-input")
const filterContainer = document.querySelector(".filters-container")
const canvasCtx = imageCanvas.getContext("2d")
const resetBtn = document.querySelector("#reset-btn")
const downloadBtn = document.querySelector("#download-btn")
const undoBtn = document.querySelector("#undo-btn")
const redoBtn = document.querySelector("#redo-btn")
const rotateLeftBtn = document.querySelector("#rotate-left-btn")
const rotateRightBtn = document.querySelector("#rotate-right-btn")
const flipHBtn = document.querySelector("#flip-h-btn")
const flipVBtn = document.querySelector("#flip-v-btn")

let file = null;
let originalImage = null;

// Filter Metadata
const filterMeta = {
    brightness: { unit: "%", min: 0, max: 200 },
    constrast: { unit: "%", min: 0, max: 200 },
    saturate: { unit: "%", min: 0, max: 200 },
    sepia: { unit: "%", min: 0, max: 100 },
    hueRotate: { unit: "deg", min: 0, max: 360 },
    invert: { unit: "%", min: 0, max: 100 },
    blur: { unit: "px", min: 0, max: 20 },
    grayscale: { unit: "%", min: 0, max: 100 },
    opacity: { unit: "%", min: 0, max: 100 },
}

// History Management
function saveState() {
    if (editorState.isUndoing) return;

    // Remove any redo history if we make a new change
    if (editorState.historyIndex < editorState.history.length - 1) {
        editorState.history = editorState.history.slice(0, editorState.historyIndex + 1);
    }

    // Deep copy current config
    const stateSnapshot = JSON.parse(JSON.stringify(editorState.config));
    editorState.history.push(stateSnapshot);

    // Cap history size
    if (editorState.history.length > editorState.maxHistory) {
        editorState.history.shift();
    } else {
        editorState.historyIndex++;
    }
}

function undo() {
    if (editorState.historyIndex > 0) {
        editorState.isUndoing = true;
        editorState.historyIndex--;
        const prevState = editorState.history[editorState.historyIndex];
        editorState.config = JSON.parse(JSON.stringify(prevState));
        updateUI();
        renderImage();
        editorState.isUndoing = false;
    }
}

function redo() {
    if (editorState.historyIndex < editorState.history.length - 1) {
        editorState.isUndoing = true;
        editorState.historyIndex++;
        const nextState = editorState.history[editorState.historyIndex];
        editorState.config = JSON.parse(JSON.stringify(nextState));
        updateUI();
        renderImage();
        editorState.isUndoing = false;
    }
}

function updateUI() {
    // Update sliders
    Object.keys(editorState.config.filters).forEach(key => {
        const input = document.getElementById(key);
        if (input) {
            input.value = editorState.config.filters[key];
        }
    });
}

function createFilterElement(name, meta) {
    const div = document.createElement("div")
    div.classList.add("filter")

    const input = document.createElement("input")
    input.type = "range"
    input.min = meta.min
    input.max = meta.max
    input.value = editorState.config.filters[name]
    input.id = name

    const p = document.createElement("p")
    p.textContent = name

    div.appendChild(p)
    div.appendChild(input)

    // Save state on change (drag end), update render on input (drag)
    input.addEventListener("change", () => saveState());
    input.addEventListener("input", () => {
        editorState.config.filters[name] = parseInt(input.value);
        renderImage();
    })

    return div
}

function createFilters() {
    filterContainer.innerHTML = '';
    Object.keys(editorState.config.filters).forEach((key) => {
        const filterElement = createFilterElement(key, filterMeta[key])
        filterContainer.appendChild(filterElement)
    })
}
createFilters()

imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (!file) return;

    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
        originalImage = img;

        // Reset state for new image
        editorState.config = JSON.parse(JSON.stringify(editorState.defaults));
        editorState.history = [];
        editorState.historyIndex = -1;
        saveState(); // Initial state

        updateUI();
        renderImage();

        // Hide placeholder and show canvas
        document.querySelector(".placeholder").style.display = "none"
        imageCanvas.style.display = "block"
    }
})


function renderImage() {
    if (!originalImage) return;

    const ctx = canvasCtx;
    const { filters, transform } = editorState.config;

    // 1. Calculate Canvas Dimensions based on Rotation
    // If rotated 90 or 270 degrees, swap width/height
    if (Math.abs(transform.rotate) % 180 !== 0) {
        imageCanvas.width = originalImage.height;
        imageCanvas.height = originalImage.width;
    } else {
        imageCanvas.width = originalImage.width;
        imageCanvas.height = originalImage.height;
    }

    // 2. Clear Canvas
    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

    // 3. Prepare Context for Drawing (Transforms)
    ctx.save();

    // Translate to center for rotation/scale
    ctx.translate(imageCanvas.width / 2, imageCanvas.height / 2);

    // Apply Rotation
    ctx.rotate(transform.rotate * Math.PI / 180);

    // Apply Flip (Scale)
    ctx.scale(transform.flipX, transform.flipY);

    // 4. Apply Filters using CSS filter property
    // Note: Canvas filters apply to the drawing operation
    ctx.filter = `
    brightness(${filters.brightness}%)
    contrast(${filters.constrast}%)
    saturate(${filters.saturate}%)
    sepia(${filters.sepia}%)
    hue-rotate(${filters.hueRotate}deg)
    invert(${filters.invert}%)
    blur(${filters.blur}px)
    grayscale(${filters.grayscale}%)
    opacity(${filters.opacity}%)
    `.trim();

    // 5. Draw Image (Centered)
    // Draw negative half-width/height to center image at the translated origin
    ctx.drawImage(originalImage, -originalImage.width / 2, -originalImage.height / 2);

    // 6. Cleanup
    ctx.restore(); // Restores translation, rotation, scale, and filter
}

// Transform Event Listeners
if (rotateLeftBtn) {
    rotateLeftBtn.addEventListener('click', () => {
        saveState();
        editorState.config.transform.rotate -= 90;
        renderImage();
    });
}

if (rotateRightBtn) {
    rotateRightBtn.addEventListener('click', () => {
        saveState();
        editorState.config.transform.rotate += 90;
        renderImage();
    });
}

if (flipHBtn) {
    flipHBtn.addEventListener('click', () => {
        saveState();
        editorState.config.transform.flipX *= -1;
        renderImage();
    });
}

if (flipVBtn) {
    flipVBtn.addEventListener('click', () => {
        saveState();
        editorState.config.transform.flipY *= -1;
        renderImage();
    });
}

// History Event Listeners
if (undoBtn) undoBtn.addEventListener('click', undo);
if (redoBtn) redoBtn.addEventListener('click', redo);

resetBtn.addEventListener('click', () => {
    saveState(); // Save state before reset
    editorState.config = JSON.parse(JSON.stringify(editorState.defaults));
    editorState.config.transform = { rotate: 0, flipX: 1, flipY: 1 }; // Explicit reset for transforms

    updateUI();
    renderImage();
})


const presetFilters = {
    vintage: {
        brightness: 120,
        sepia: 40,
        opacity: 100,
        blur: 0,
        grayscale: 0,
        hueRotate: 0,
        invert: 0,
        saturate: 100,
        constrast: 100
    },
    lomo: {
        brightness: 100,
        constrast: 120,
        saturate: 120,
        sepia: 10,
        opacity: 100,
        blur: 0,
        grayscale: 0,
        hueRotate: 0,
        invert: 0
    },
    clarity: {
        brightness: 105,
        constrast: 120,
        saturate: 100,
        grayscale: 0,
        opacity: 100,
        blur: 0,
        sepia: 0,
        hueRotate: 0,
        invert: 0
    },
    sincity: {
        brightness: 100,
        constrast: 100,
        grayscale: 100,
        brightness: 110,
        opacity: 100,
        blur: 0,
        sepia: 0,
        hueRotate: 0,
        invert: 0,
        saturate: 100
    },
    crossprocess: {
        brightness: 100,
        constrast: 100,
        sepia: 20,
        hueRotate: 0,
        invert: 0,
        saturate: 100,
        opacity: 100,
        blur: 0,
        grayscale: 0
    },
    pinhole: {
        brightness: 100,
        constrast: 100,
        sepia: 0,
        hueRotate: 0,
        invert: 0,
        saturate: 0,
        opacity: 100,
        blur: 0,
        grayscale: 0
    },
    nostalgia: {
        brightness: 100,
        constrast: 100,
        sepia: 40,
        hueRotate: 0,
        invert: 0,
        saturate: 100,
        opacity: 100,
        blur: 0,
        grayscale: 100
    },
    majestic: {
        brightness: 110,
        constrast: 110,
        saturate: 110,
        sepia: 30,
        hueRotate: 0,
        invert: 0,
        opacity: 100,
        blur: 0,
        grayscale: 0
    }
}

const presetBtns = document.querySelectorAll(".preset-btn")

function applyPreset(presetName) {
    const preset = presetFilters[presetName]
    if (!preset) return

    saveState(); // Save before applying preset

    Object.keys(preset).forEach((key) => {
        // Fix typo in state config vs preset if needed
        // Assuming preset keys match state keys exactly
        if (editorState.config.filters.hasOwnProperty(key)) {
            editorState.config.filters[key] = preset[key];
        }
    })

    updateUI();
    renderImage();
}

presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const presetName = btn.getAttribute("data-preset")
        applyPreset(presetName)
    })
})

downloadBtn.addEventListener('click', () => {
    if (!originalImage) {
        alert("Please choose an image first!")
        return
    }
    const link = document.createElement("a")
    link.download = "edited-image.jpg"
    // Use the canvas directly as it now contains the transformed and filtered image
    link.href = imageCanvas.toDataURL("image/jpeg", 0.8) // Use JPG 0.8 quality for standard export 
    link.click()
})

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
            redo();
        } else {
            undo();
        }
    }
    if (e.key === 'r') {
        // Only trigger reset if not typing in inputs
        if (document.activeElement.tagName !== 'INPUT') {
            resetBtn.click();
        }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        downloadBtn.click();
    }
});

let filters = {
    brightness: {
        value: 100,
        min: 0,
        max: 200,
        unit: "%",
    },
    constrast: {
        value: 100,
        min: 0,
        max: 200,
        unit: "%",
    },
    saturate: {
        value: 100,
        min: 0,
        max: 200,
        unit: "%",
    },
    sepia: {
        value: 0,
        min: 0,
        max: 100,
        unit: "%",
    },
    hueRotate: {
        value: 0,
        min: 0,
        max: 360,
        unit: "deg",
    },
    invert: {
        value: 0,
        min: 0,
        max: 100,
        unit: "%",
    },
    blur: {
        value: 0,
        min: 0,
        max: 20,
        unit: "px",
    },
    grayscale: {
        value: 0,
        min: 0,
        max: 100,
        unit: "%",
    },
    opacity: {
        value: 100,
        min: 0,
        max: 100,
        unit: "%",
    },
}

const imageCanvas = document.querySelector("#image-canvas")
const imageInput = document.querySelector("#image-input")
const filterContainer = document.querySelector(".filters-container")
const canvasCtx = imageCanvas.getContext("2d")
const resetBtn = document.querySelector("#reset-btn")
const downloadBtn = document.querySelector("#download-btn")
let file = null;
let image = null;

function createFilterElement(name, unit = "%", value, min, max) {
    const div = document.createElement("div")
    div.classList.add("filter")


    const input = document.createElement("input")
    input.type = "range"
    input.min = min
    input.max = max
    input.value = value
    input.unit = unit
    input.id = name

    const p = document.createElement("p")
    p.textContent = name

    div.appendChild(p)
    div.appendChild(input)

    input.addEventListener("input", (e) => {
        filters[name].value = input.value
        applyFilters()
    })

    return div
}

function createFilters() {
    Object.keys(filters).forEach((key) => {
        const filterElement = createFilterElement(key, filters[key].unit, filters[key].value, filters[key].min, filters[key].max)
        filterContainer.appendChild(filterElement)
    })
}
createFilters()

imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0]

    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
        image = img;
        imageCanvas.width = img.width
        imageCanvas.height = img.height
        canvasCtx.drawImage(img, 0, 0)

        // Hide placeholder and show canvas
        document.querySelector(".placeholder").style.display = "none"
        imageCanvas.style.display = "block"
    }
})

function applyFilters() {
    canvasCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height)
    canvasCtx.filter = `
    brightness(${filters.brightness.value}${filters.brightness.unit})
    contrast(${filters.constrast.value}${filters.constrast.unit})
    saturate(${filters.saturate.value}${filters.saturate.unit})
    sepia(${filters.sepia.value}${filters.sepia.unit})
    hue-rotate(${filters.hueRotate.value}${filters.hueRotate.unit})
    invert(${filters.invert.value}${filters.invert.unit})
    blur(${filters.blur.value}${filters.blur.unit})
    grayscale(${filters.grayscale.value}${filters.grayscale.unit})
    opacity(${filters.opacity.value}${filters.opacity.unit})
    `.trim()
    canvasCtx.drawImage(image, 0, 0);
}

resetBtn.addEventListener('click', () => {
    filters = {
        brightness: {
            value: 100,
            min: 0,
            max: 200,
            unit: "%",
        },
        constrast: {
            value: 100,
            min: 0,
            max: 200,
            unit: "%",
        },
        saturate: {
            value: 100,
            min: 0,
            max: 200,
            unit: "%",
        },
        sepia: {
            value: 0,
            min: 0,
            max: 100,
            unit: "%",
        },
        hueRotate: {
            value: 0,
            min: 0,
            max: 360,
            unit: "deg",
        },
        invert: {
            value: 0,
            min: 0,
            max: 100,
            unit: "%",
        },
        blur: {
            value: 0,
            min: 0,
            max: 20,
            unit: "px",
        },
        grayscale: {
            value: 0,
            min: 0,
            max: 100,
            unit: "%",
        },
        opacity: {
            value: 100,
            min: 0,
            max: 100,
            unit: "%",
        },
    }

    // Update the input sliders to reflect the reset values
    Object.keys(filters).forEach((key) => {
        const input = document.getElementById(key)
        if (input) {
            input.value = filters[key].value
        }
    })

    applyFilters()
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

    Object.keys(preset).forEach((key) => {
        if (filters[key]) {
            filters[key].value = preset[key]

            // Update the slider input if it exists
            const input = document.getElementById(key)
            if (input) {
                input.value = preset[key]
            }
        }
    })

    applyFilters()
}

presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const presetName = btn.getAttribute("data-preset")
        applyPreset(presetName)
    })
})

downloadBtn.addEventListener('click', () => {
    if (!image) {
        alert("Please choose an image first!")
        return
    }
    const link = document.createElement("a")
    link.download = "edited-image.jpg"
    link.href = imageCanvas.toDataURL()
    link.click()
})

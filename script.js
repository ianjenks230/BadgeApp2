const combineBtn = document.getElementById("combineBtn");
const downloadBtn = document.getElementById("downloadBtn");
const clearBtn = document.getElementById("clearBtn"); // New clear button
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Badge image paths
const badgeImages = {
    ozpertBadges: {
        bronze: 'badges/ozpert-bronze.png',
        silver: 'badges/ozpert-silver.png',
        gold: 'badges/ozpert-gold.png',
        diamond: 'badges/ozpert-diamond.png'
    },
    coreValues: {
        bePositive: 'badges/be-positive.png',
        empathize: 'badges/empathize.png',
        evolveConstantly: 'badges/evolve-constantly.png',
        focusOnOutcome: 'badges/focus-on-outcome.png',
        succeedAsTeam: 'badges/succeed-as-team.png'
    },
    ozImage: 'badges/OZ.png' // Fixed OZ image
};

let combinedImageBlob = null;

// Function to resize image maintaining aspect ratio
function resizeImage(img, targetWidth, targetHeight) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Calculate aspect ratios
    const imgRatio = img.width / img.height;
    const targetRatio = targetWidth / targetHeight;

    // Determine dimensions to maintain aspect ratio
    let finalWidth = targetWidth;
    let finalHeight = targetHeight;

    if (imgRatio > targetRatio) {
        finalHeight = targetWidth / imgRatio;
    } else {
        finalWidth = targetHeight * imgRatio;
    }

    // Center the image in the target space
    const offsetX = (targetWidth - finalWidth) / 2;
    const offsetY = (targetHeight - finalHeight) / 2;

    // Set canvas size to target dimensions
    tempCanvas.width = targetWidth;
    tempCanvas.height = targetHeight;

    // Draw with white background
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, targetWidth, targetHeight);

    // Draw resized image centered
    tempCtx.drawImage(img, offsetX, offsetY, finalWidth, finalHeight);

    return tempCanvas;
}

// Function to load an image from URL
function loadImageFromUrl(url) {
    console.log('Loading image from:', url);
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            console.log('Successfully loaded image:', url);
            resolve(img);
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${url}`);
            reject(new Error(`Failed to load image: ${url}`));
        };
        img.src = url;
    });
}

// Function to get selected radio button value from a group
function getSelectedValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : null;
}

// Function to clear all radio button selections
function clearSelections() {
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
    });
    canvas.width = 0;
    canvas.height = 0;
    combinedImageBlob = null;
    downloadBtn.disabled = true;
}

combineBtn.addEventListener("click", async () => {
    console.log('Combine button clicked');
    const ozpertValue = getSelectedValue('ozpertBadge');
    const coreValue = getSelectedValue('coreValue');
    
    console.log('Selected badges:', { ozpertValue, coreValue });
    
    if (!ozpertValue && !coreValue) {
        alert("Please select at least one badge.");
        return;
    }

    try {
        // Prepare images to load
        const imagesToLoad = [loadImageFromUrl(badgeImages.ozImage)]; // Always load OZ image
        let totalWidth = 0;
        let standardSize = 0;

        // Handle single or dual badge selection
        if (ozpertValue && coreValue) {
            // Both badges selected
            imagesToLoad.push(
                loadImageFromUrl(badgeImages.ozpertBadges[ozpertValue]),
                loadImageFromUrl(badgeImages.coreValues[coreValue])
            );
        } else if (ozpertValue) {
            // Only Ozpert badge selected
            imagesToLoad.push(loadImageFromUrl(badgeImages.ozpertBadges[ozpertValue]));
        } else if (coreValue) {
            // Only Core Value badge selected
            imagesToLoad.push(loadImageFromUrl(badgeImages.coreValues[coreValue]));
        }

        // Load all selected images
        const selectedImages = await Promise.all(imagesToLoad);

        // OZ image retains original dimensions
        const ozImage = selectedImages[0];

        // Standardize size for badges
        if (selectedImages.length > 1) {
            standardSize = Math.max(
                ...selectedImages.slice(1).map(img => Math.max(img.width, img.height))
            );
        }

        // Resize badges if any
        const resizedBadges = selectedImages.slice(1).map(img => 
            resizeImage(img, standardSize, standardSize)
        );

        // Calculate total width
        totalWidth = ozImage.width + standardSize * resizedBadges.length;
        const standardHeight = Math.max(ozImage.height, standardSize);

        // Resize canvas
        canvas.width = totalWidth;
        canvas.height = standardHeight;

        // Draw background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, totalWidth, standardHeight);

        // Draw OZ image on the left
        ctx.drawImage(ozImage, 0, (standardHeight - ozImage.height) / 2);

        // Draw resized badges sequentially
        resizedBadges.forEach((badge, index) => {
            ctx.drawImage(badge, ozImage.width + index * standardSize, 0);
        });

        // Convert to Blob for download
        canvas.toBlob(blob => {
            combinedImageBlob = blob;
            downloadBtn.disabled = false;
        }, "image/png");
    } catch (error) {
        console.error('Error processing images:', error);
        alert('Error processing one or more images. Please try again with valid image files.');
    }
});

downloadBtn.addEventListener("click", () => {
    if (!combinedImageBlob) return;
    const url = URL.createObjectURL(combinedImageBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "combined_badges.png";
    a.click();
    URL.revokeObjectURL(url);
});

clearBtn.addEventListener("click", clearSelections);

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}
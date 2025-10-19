const combineBtn = document.getElementById("combineBtn");
const downloadBtn = document.getElementById("downloadBtn");
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
    }
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
    // Image is wider than target ratio
    finalHeight = targetWidth / imgRatio;
  } else {
    // Image is taller than target ratio
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

combineBtn.addEventListener("click", async () => {
    console.log('Combine button clicked');
    const ozpertValue = getSelectedValue('ozpertBadge');
    const coreValue = getSelectedValue('coreValue');
    
    console.log('Selected badges:', { ozpertValue, coreValue });
    
    if (!ozpertValue || !coreValue) {
        alert("Please select one badge from each category.");
        return;
    }

    try {
        // Load selected images
        const selectedImages = await Promise.all([
            loadImageFromUrl(badgeImages.ozpertBadges[ozpertValue]),
            loadImageFromUrl(badgeImages.coreValues[coreValue])
        ]);

        // Find the ideal dimensions
        const maxWidth = Math.max(...selectedImages.map(img => img.width));
        const maxHeight = Math.max(...selectedImages.map(img => img.height));

        // Standardize size for all images
        const standardSize = Math.max(maxWidth, maxHeight);
        const resizedImages = selectedImages.map(img => resizeImage(img, standardSize, standardSize));

    // Calculate total width and use standard height
    const totalWidth = standardSize * resizedImages.length;
    const standardHeight = standardSize;

    // Resize canvas
    canvas.width = totalWidth;
    canvas.height = standardHeight;

    // Draw background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, totalWidth, standardHeight);

    // Draw images side by side
    let xOffset = 0;
    resizedImages.forEach(img => {
      ctx.drawImage(img, xOffset, 0);
      xOffset += standardSize;
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

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const fileInput = document.getElementById("fileInput");
const combineBtn = document.getElementById("combineBtn");
const downloadBtn = document.getElementById("downloadBtn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let combinedImageBlob = null;

combineBtn.addEventListener("click", async () => {
  const files = fileInput.files;
  if (!files.length) {
    alert("Please select one or more images first.");
    return;
  }

  const images = await Promise.all([...files].map(loadImage));

  // Determine total width and max height
  const totalWidth = images.reduce((sum, img) => sum + img.width, 0);
  const maxHeight = Math.max(...images.map(img => img.height));

  // Resize canvas
  canvas.width = totalWidth;
  canvas.height = maxHeight;

  // Draw images side by side
  let xOffset = 0;
  images.forEach(img => {
    ctx.drawImage(img, xOffset, 0);
    xOffset += img.width;
  });

  // Convert to Blob for download
  canvas.toBlob(blob => {
    combinedImageBlob = blob;
    downloadBtn.disabled = false;
  }, "image/png");
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

const uploadBox = document.getElementById("upload-box");
const imageInput = document.getElementById("imageUpload");
const previewSection = document.getElementById("preview-section");
const canvas = document.getElementById("resultCanvas");
const ctx = canvas.getContext("2d");
const shareBtn = document.getElementById("shareBtn");
const downloadBtn = document.getElementById("downloadBtn");

uploadBox.addEventListener("click", () => imageInput.click());
imageInput.addEventListener("change", handleImageUpload);

async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function (event) {
    const imageData = event.target.result;

    // Show loading text
    uploadBox.innerHTML = "<p>Removing background... please wait.</p>";

    // Background removal using imgly SDK
    const { removeBackground } = window.imgly;
    try {
      const resultBlob = await removeBackground(imageData, {
        output: { format: "image/png" }
      });

      const url = URL.createObjectURL(resultBlob);
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, img.width, img.height);
        previewSection.style.display = "block";
      };
      img.src = url;

      // Reset upload box
      uploadBox.innerHTML = `<p>Click or drag another jewellery image</p>`;

      // Set download/share functionality
      downloadBtn.onclick = () => downloadImage(resultBlob);
      shareBtn.onclick = () => shareImage(resultBlob);
    } catch (err) {
      console.error(err);
      uploadBox.innerHTML = "<p>Something went wrong. Try again.</p>";
    }
  };
  reader.readAsDataURL(file);
}

// Download processed image
function downloadImage(blob) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "jewellery.png";
  link.click();
}

// Share using Web Share API
async function shareImage(blob) {
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], "jewellery.png", { type: "image/png" })] })) {
    await navigator.share({
      files: [new File([blob], "jewellery.png", { type: "image/png" })],
      title: "My Jewellery Design",
      text: "Check out this jewellery image I just processed!"
    });
  } else {
    alert("Sharing not supported on this device.");
  }
}

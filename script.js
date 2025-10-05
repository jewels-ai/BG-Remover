const uploadBox = document.getElementById("upload-box");
const imageInput = document.getElementById("imageUpload");
const previewSection = document.getElementById("preview-section");
const canvas = document.getElementById("resultCanvas");
const ctx = canvas.getContext("2d");
const shareBtn = document.getElementById("shareBtn");
const downloadBtn = document.getElementById("downloadBtn");

uploadBox.addEventListener("click", () => imageInput.click());
imageInput.addEventListener("change", handleImageUpload);

// 🧠 Replace this with your own remove.bg API key
const REMOVE_BG_API_KEY = "YOUR_REMOVE_BG_API_KEY";

async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function (event) {
    const imageData = event.target.result;

    uploadBox.innerHTML = "<p>Removing background... please wait ⏳</p>";

    try {
      const resultBlob = await removeBackgroundAPI(imageData);

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

      uploadBox.innerHTML = `<p>Click or drag another jewellery image</p>`;

      downloadBtn.onclick = () => downloadImage(resultBlob);
      shareBtn.onclick = () => shareImage(resultBlob);

    } catch (err) {
      console.error(err);
      uploadBox.innerHTML = "<p>⚠️ Something went wrong. Please check your API key.</p>";
    }
  };
  reader.readAsDataURL(file);
}

// 🔧 Background Removal using Remove.bg API
async function removeBackgroundAPI(imageData) {
  const formData = new FormData();
  formData.append("image_file", dataURLtoBlob(imageData));
  formData.append("size", "auto");

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": REMOVE_BG_API_KEY
    },
    body: formData
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Remove.bg error: ${errText}`);
  }

  return await response.blob();
}

// Convert base64 → Blob
function dataURLtoBlob(dataURL) {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: mimeString });
}

// 💾 Download processed image
function downloadImage(blob) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "jewellery.png";
  link.click();
}

// 📲 Share via Web Share API (mobile browsers)
async function shareImage(blob) {
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], "jewellery.png", { type: "image/png" })] })) {
    await navigator.share({
      files: [new File([blob], "jewellery.png", { type: "image/png" })],
      title: "My Jewellery Design",
      text: "Check out this jewellery image I just processed!"
    });
  } else {
    alert("Sharing not supported on this device. Try downloading instead.");
  }
}

export function attachOpenCamera(button, input) {
  button.addEventListener("click", () => {
    input.click();
  });
}

export function showCapturedPhoto(preview, file, createObjectURL) {
  if (!file) return;
  const makeUrl = createObjectURL ?? URL.createObjectURL.bind(URL);
  if (typeof preview.src === "string" && preview.src.startsWith("blob:") && URL.revokeObjectURL) {
    URL.revokeObjectURL(preview.src);
  }
  preview.src = makeUrl(file);
  preview.hidden = false;
  preview.alt = "Captured photo";
}

export function attachPreview(input, preview) {
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    showCapturedPhoto(preview, file);
  });
}

function start() {
  const button = document.querySelector("#open-camera");
  const input = document.querySelector("#camera-input");
  const preview = document.querySelector("#preview");
  if (button && input) attachOpenCamera(button, input);
  if (input && preview) attachPreview(input, preview);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
}

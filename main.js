const ORIGINAL_IMAGE_ID = "original-img";
const CANVAS_ID = "canvas";
const FORM_ID = "image-form";
const DOWNLOAD_BUTTON_ID = "download-button";
const IMAGE_INPUT_ID = "image-input";
const IMAGE_LABEL_ID = "image-label";

window.onload = () => {
  Listeners.inputFileChange(IMAGE_INPUT_ID, IMAGE_LABEL_ID);
  Listeners.formSubmit(FORM_ID);
  Listeners.downloadButton(DOWNLOAD_BUTTON_ID, ORIGINAL_IMAGE_ID, CANVAS_ID);
};

const Listeners = {
  formSubmit: (formId) => {
    const form = document.getElementById(formId);
    form.addEventListener("submit", (formEvent) => {
      formEvent.preventDefault();
      ImageProcessor.getImageDataFromInputFile("#image-form input[type=file]")
        .then((imageData) => ImageProcessor.getImageObject(imageData))
        .then((imageObject) =>
          ImageProcessor.createPreviewAndCanvas(
            imageObject,
            ORIGINAL_IMAGE_ID,
            CANVAS_ID,
            ImageProcessor.drawImageOnCanvas
          )
        );
    });
  },
  downloadButton: (downloadButtonId, originalImageId, canvasId) => {
    const downloadButtonElement = document.getElementById(downloadButtonId);
    const canvasElement = document.getElementById(canvasId);
    downloadButtonElement.addEventListener("click", (event) => {
      const originalImage = document.getElementById(originalImageId);
      if (!originalImage) event.preventDefault();
      const imageToDownload = canvasElement
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      downloadButtonElement.setAttribute("href", imageToDownload);
    });
  },
  inputFileChange: (imageInputId, imageLabelId) => {
    const input = document.getElementById(imageInputId);
    input.addEventListener("change", (event) => {
      const label = document.getElementById(imageLabelId);
      label.innerText = event.target.files[0].name;
    });
  },
};

const ImageProcessor = {
  getImageDataFromInputFile: (query) => {
    const imageData = document.querySelector(query).files[0];
    return new Promise((resolve) => resolve(imageData));
  },
  getImageObject: (imageData) => {
    const fileReader = new FileReader();
    const imageObject = new Image();
    fileReader.readAsDataURL(imageData);
    fileReader.onload = (event) => {
      imageObject.src = event.target.result;
    };
    return new Promise((resolve) => resolve(imageObject));
  },
  createPreviewAndCanvas: (imageObject, imageId, canvasId, canvasCallback) => {
    const imageElement = document.createElement("img");
    imageObject.onload = () => {
      const oldImage = document.getElementById(imageId);
      if (oldImage) {
        oldImage.remove();
      }
      imageElement.src = imageObject.src;
      imageElement.width = imageObject.width;
      imageElement.height = imageObject.height;
      imageElement.id = imageId;
      imageElement.className = "hidden";

      document
        .querySelector(".preview-original-image")
        .appendChild(imageElement);

      canvasCallback(canvasId, imageId);
    };

    return new Promise((resolve) => resolve());
  },
  drawImageOnCanvas: (canvasElementId, originalImageElementId) => {
    const canvas = document.getElementById(canvasElementId),
      originalImage = document.getElementById(originalImageElementId),
      canvasContext = canvas.getContext("2d");

    canvas.height = originalImage.height;
    canvas.width = originalImage.width;
    canvasContext.drawImage(originalImage, 0, 0);

    const imageData = canvasContext.getImageData(
        0,
        0,
        originalImage.width,
        originalImage.height
      ),
      pixels = imageData.data,
      transparency = { r: 0, g: 0, b: 0, a: 0 };

    for (
      let cursor = 0, totalOfPixels = pixels.length;
      cursor < totalOfPixels;
      cursor += 4
    ) {
      let r = pixels[cursor],
        g = pixels[cursor + 1],
        b = pixels[cursor + 2];

      if (r === 255 && g === 255 && b === 255) {
        pixels[cursor] = transparency.r;
        pixels[cursor + 1] = transparency.g;
        pixels[cursor + 2] = transparency.b;
        pixels[cursor + 3] = transparency.a;
      }
    }

    canvasContext.putImageData(imageData, 0, 0);
  },
};

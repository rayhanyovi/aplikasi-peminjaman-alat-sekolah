import imageCompression from "browser-image-compression";

export const WebpImageConverter = async (file: File) => {
  try {
    const options = {
      maxSizeMB: 0.5,
      useWebWorker: true,
      fileType: "image/webp",
      maxIteration: 20,
    };

    const compressedFile = await imageCompression(file, options);

    const newFormData = new FormData();
    newFormData.append("file", compressedFile, compressedFile.name);

    return newFormData;
  } catch (error) {
    console.error("[WebpImageConverter] Failed to convert:", error);
    throw error;
  }
};

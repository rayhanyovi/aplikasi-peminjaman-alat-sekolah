import imageCompression from "browser-image-compression";

export const WebpImageConverter = async (file: File) => {
  try {
    console.log("[WebpImageConverter] Original file:", file);

    const options = {
      maxSizeMB: 0.5,
      useWebWorker: true,
      fileType: "image/webp",
      maxIteration: 20,
    };

    const compressedFile = await imageCompression(file, options);

    console.log("[WebpImageConverter] Compressed file:", compressedFile);

    const newFormData = new FormData();
    newFormData.append("file", compressedFile, compressedFile.name);

    return newFormData;
  } catch (error) {
    console.error("[WebpImageConverter] Failed to convert:", error);
    throw error;
  }
};

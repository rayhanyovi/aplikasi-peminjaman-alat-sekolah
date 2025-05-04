import imageCompression from "browser-image-compression";

export const WebpImageConverter = async (file: File) => {
  try {
    const options = {
      maxSizeMB: 0.3, // Reduce max size from 0.5MB to 0.3MB
      useWebWorker: true,
      fileType: "image/webp",
      maxIteration: 20,
      maxWidthOrHeight: 800, // Add max dimension to further reduce size
      initialQuality: 0.7, // Add initial quality setting
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

export const WebpImageConverterFromUrl = async (imageUrl: string) => {
  try {
    // Fetch the image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Convert to blob
    const blob = await response.blob();

    // Create a File object from the blob
    const fileName = imageUrl.split("/").pop() || "image.jpg";
    const file = new File([blob], fileName, { type: blob.type });

    // Use the existing WebP converter
    return WebpImageConverter(file);
  } catch (error) {
    console.error("[WebpImageConverterFromUrl] Failed to convert:", error);
    throw error;
  }
};

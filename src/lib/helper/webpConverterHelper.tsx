import imageCompression from "browser-image-compression";

export const WebpImageConverter = async (file: File) => {
  try {
    const maxSizeKB = 5;
    const options = {
      maxSizeMB: maxSizeKB / 1024, // Convert to MB
      useWebWorker: true,
      fileType: "image/webp",
      maxIteration: 30,
      maxWidthOrHeight: 300, // Reduce dimensions aggressively
      initialQuality: 0.4, // Start low
    };

    const compressedFile = await imageCompression(file, options);

    // Check actual size
    const finalSizeKB = compressedFile.size / 1024;

    if (finalSizeKB > maxSizeKB) {
      throw new Error(
        `[WebpImageConverter] Compression failed to meet size target: ${finalSizeKB.toFixed(
          2
        )}KB`
      );
    }

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

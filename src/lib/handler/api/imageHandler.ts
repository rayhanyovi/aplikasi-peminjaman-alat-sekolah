import {
  WebpImageConverter,
  WebpImageConverterFromUrl,
} from "@/lib/helper/webpConverterHelper"; // pastikan path-nya sesuai

export const uploadImageHandler = async (
  file: File,
  type: string,
  id: string
) => {
  try {
    const formData = await WebpImageConverter(file);

    formData.append("type", type);
    formData.append("id", id);

    const res = await fetch("/api/image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const json = await res.json();

    return json;
  } catch (err) {
    console.error("[uploadImageHandler] Error:", err);
    throw err;
  }
};

export const uploadImageFromUrl = async (
  imageUrl: string,
  type: string,
  id: string
) => {
  try {
    if (!imageUrl) {
      return { success: true, url: null };
    }

    if (imageUrl.includes("supabase") && imageUrl.includes("storage")) {
      return { success: true, url: imageUrl };
    }

    const formData = await WebpImageConverterFromUrl(imageUrl);

    formData.append("type", type);
    formData.append("id", id);

    const res = await fetch("/api/image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const json = await res.json();

    return json;
  } catch (err) {
    console.error("[uploadImageFromUrl] Error:", err);
    // Return a default image URL or null instead of throwing
    return { success: false, url: null, error: err };
  }
};

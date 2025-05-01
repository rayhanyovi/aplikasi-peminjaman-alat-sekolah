import { WebpImageConverter } from "@/lib/helper/webpConverterHelper"; // pastikan path-nya sesuai

export const uploadImageHandler = async (file: File) => {
  try {
    const formData = await WebpImageConverter(file);

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

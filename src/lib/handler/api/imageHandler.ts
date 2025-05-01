import { WebpImageConverter } from "@/lib/helper/webpConverterHelper"; // pastikan path-nya sesuai

export const uploadImageHandler = async (file: File) => {
  try {
    console.log("[uploadImageHandler] Original file:", file);

    const formData = await WebpImageConverter(file);

    console.log("[uploadImageHandler] Final FormData:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const res = await fetch("/api/image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const json = await res.json();
    console.log("[uploadImageHandler] Response JSON:", json);

    return json;
  } catch (err) {
    console.error("[uploadImageHandler] Error:", err);
    throw err;
  }
};

"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Upload, message } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import type { UploadProps, UploadFile } from "antd";

interface ImageUploaderProps {
  onSuccess?: (file: File) => void;
  maxSizeMB?: number;
  existedFileList?: UploadFile[];
  size?: number | string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onSuccess,
  existedFileList,
  maxSizeMB = 2,
  size = 160,
}) => {
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>(existedFileList ?? []);

  useEffect(() => {
    const thumbnail = document.querySelector(
      ".customSizedUpload .ant-upload"
    ) as HTMLElement | null;

    const uploadComponent = document.querySelector(
      ".customSizedUpload .ant-upload-list-item-container"
    ) as HTMLElement | null;

    if (size && thumbnail && uploadComponent) {
      uploadComponent.style.setProperty("width", `${size}px`, "important");
      uploadComponent.style.setProperty("height", `${size}px`, "important");
      thumbnail.style.setProperty("width", `${size}px`, "important");
      thumbnail.style.setProperty("height", `${size}px`, "important");
    }
  }, [fileList, size]);

  const customRequest = async (options: any) => {
    const { file, onSuccess: onAntdSuccess, onError } = options;

    try {
      setUploading(true);

      // Check file size before uploading
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        throw new Error(
          `File size exceeds ${maxSizeMB}MB limit. Please choose a smaller file.`
        );
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      const uploadFile: UploadFile = {
        uid: file.uid,
        name: file.name,
        status: "uploading",
        url: previewUrl,
      };

      setFileList([uploadFile]);

      // Panggil onSuccess dengan file asli
      onSuccess?.(file);

      // Simulasi upload berhasil
      setTimeout(() => {
        const successFile: UploadFile = {
          ...uploadFile,
          status: "done",
        };

        setFileList([successFile]);
        setUploading(false);
        onAntdSuccess("Success", file);
      }, 1000);
    } catch (error: any) {
      const errorFile: UploadFile = {
        uid: file.uid,
        name: file.name,
        status: "error",
      };

      setFileList([errorFile]);
      setUploading(false);
      onError(error);
      message.error(error.message || "Upload failed");
    }
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return false;
    }
    return true;
  };

  const props: UploadProps = {
    customRequest,
    fileList: fileList,
    onChange: handleChange,
    beforeUpload,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: false,
    },
    accept: "image/*",
    listType: "picture-card",
    maxCount: 1,
  };

  const uploadButton = (
    <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100">
      {uploading ? (
        <LoadingOutlined style={{ fontSize: 24 }} />
      ) : (
        <PlusOutlined style={{ fontSize: 24 }} />
      )}
      <div className="mt-2 text-sm text-gray-600">Upload</div>
    </div>
  );

  return (
    <Upload className="customSizedUpload" {...props}>
      {fileList.length >= 1 ? null : uploadButton}
    </Upload>
  );
};

export default ImageUploader;

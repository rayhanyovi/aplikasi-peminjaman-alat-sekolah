import React, { useState } from "react";
import { Upload, message } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import type { UploadProps, UploadFile } from "antd";
import type { RcFile } from "antd/es/upload";
import { uploadImageHandler } from "@/lib/handler/api/imageHandler";

interface ImageUploaderProps {
  onSuccess?: (file: File) => void; // Ubah dari string ke File
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const customRequest = async (options: any) => {
    const { file, onSuccess: onAntdSuccess, onError } = options;

    try {
      setUploading(true);

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
    } catch (error) {
      const errorFile: UploadFile = {
        uid: file.uid,
        name: file.name,
        status: "error",
      };

      setFileList([errorFile]);
      setUploading(false);
      onError(error);
      message.error("Upload failed");
    }
  };
  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const props: UploadProps = {
    customRequest,
    fileList: fileList,
    onChange: handleChange,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: false,
    },
    accept: "image/*",
    listType: "picture-card",
    maxCount: 1, // Jika Anda hanya ingin mengupload satu file
  };

  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Upload {...props}>{fileList.length >= 1 ? null : uploadButton}</Upload>
  );
};

export default ImageUploader;

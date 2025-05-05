"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { Form, Input, Select, Button, Typography, message, Modal } from "antd";
import { AddNewItem, UpdateItem } from "@/lib/handler/api/itemsHandler";
import ImageUploader from "./ImageUploader";
import { uploadImageHandler } from "@/lib/handler/api/imageHandler";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function AddItemModal({ open, onClose }: any) {
  const router = useRouter();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null); // Ubah dari imageUrl ke imageFile

  const handleSubmit = async (values: any) => {
    setIsLoading(true);

    if (!imageFile) {
      message.error("Please upload an image.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await AddNewItem(values);

      const uploadResponse = await uploadImageHandler(
        imageFile,
        "item",
        response.data.id
      );

      const valuesWithImage = {
        ...response,
        image: uploadResponse.url,
      };

      const result = await UpdateItem(response.data.id, valuesWithImage);
      if (result.success) {
        message.success("Equipment added successfully");
        router.refresh();
      }
    } catch (error) {
      message.error("Failed to upload image or add equipment");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Tambahkan Item"
      open={open}
      onCancel={() => {
        onClose(false);
        form.resetFields();
      }}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="flex flex-col"
      >
        <div className="flex flex-row gap-10 !my-8">
          <div className="mt-0 flex-shrink-0">
            <p className="mb-2">
              <span className="text-red-500 text-sm">*</span> Upload Gambar
            </p>
            <ImageUploader
              size={288}
              onSuccess={(file) => setImageFile(file)}
            />
          </div>
          <div className="flex flex-col gap-0 w-full">
            <Form.Item
              name="name"
              label="Equipment Name"
              rules={[
                {
                  required: true,
                  message: "Please enter the equipment name",
                },
              ]}
            >
              <Input placeholder="Enter equipment name" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Serial Number"
              rules={[
                {
                  required: true,
                  message: "Please enter the serial number",
                },
              ]}
            >
              <Input placeholder="Enter serial number" />
            </Form.Item>
          </div>
        </div>

        <Form.Item className="flex justify-end !m-0">
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Konfirmasi
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

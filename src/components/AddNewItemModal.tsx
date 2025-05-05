"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { Form, Input, Select, Button, Typography, message, Modal } from "antd";
import { AddNewItem } from "@/lib/handler/api/itemsHandler";
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
      const uploadResponse = await uploadImageHandler(imageFile);

      const valuesWithImage = {
        ...values,
        image: uploadResponse.url,
      };

      await AddNewItem(valuesWithImage);

      message.success("Equipment added successfully");
      // router.push("/dashboard/items");
    } catch (error) {
      message.error("Failed to upload image or add equipment");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
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
        initialValues={{
          status: "available",
        }}
      >
        <ImageUploader size={288} onSuccess={(file) => setImageFile(file)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <Form.Item
            name="status"
            label="Status"
            rules={[
              {
                required: true,
                message: "Please select a status",
              },
            ]}
          >
            <Select placeholder="Select a status">
              <Option value="tersedia">Tersedia</Option>
              <Option value="dipinjam">Dipinjam</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item className="flex justify-end">
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Confirm Add Equipment
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

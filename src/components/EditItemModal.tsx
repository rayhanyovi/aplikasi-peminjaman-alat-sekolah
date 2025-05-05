"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Typography, message, Modal, Image } from "antd";
import { UpdateItem, GetItemDetails } from "@/lib/handler/api/itemsHandler";
import ImageUploader from "./ImageUploader";
import { uploadImageHandler } from "@/lib/handler/api/imageHandler";

const { Title } = Typography;

export default function EditItemModal({
  itemId,
  open,
  onClose,
}: {
  itemId: string;
  open: boolean;
  onClose: any;
}) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // Fetch item details when modal opens
  useEffect(() => {
    if (open && itemId) {
      fetchItemDetails();
    }
  }, [open, itemId]);

  const fetchItemDetails = async () => {
    setIsFetching(true);
    try {
      const response = await GetItemDetails(itemId);
      if (response.success) {
        const item = response.data.item;
        form.setFieldsValue({
          name: item.name,
          code: item.code,
        });
        setCurrentImage(item.image);
      } else {
        message.error("Failed to fetch item details");
      }
    } catch (error) {
      console.error(error);
      message.error("Error fetching item details");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setIsLoading(true);

    try {
      let imageUrl = currentImage;

      if (imageFile) {
        const uploadResponse = await uploadImageHandler(
          imageFile,
          "item",
          itemId
        );
        if (uploadResponse.success) {
          imageUrl = uploadResponse.url;
        } else {
          throw new Error("Failed to upload image");
        }
      }

      const updateData = {
        name: values.name,
        code: values.code,
        image: imageUrl,
      };

      const response = await UpdateItem(itemId, updateData);

      if (response.success) {
        message.success("Item updated successfully");
        onClose(true); // Close modal and indicate success
        router.refresh(); // Refresh the page to show updated data
      } else {
        throw new Error(response.error || "Failed to update item");
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.message || "Failed to update item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageFile(null);
    onClose(false);
  };

  return (
    <Modal
      title="Edit Item"
      open={open}
      onCancel={handleCancel}
      footer={null}
      confirmLoading={isLoading}
      width={600}
    >
      {isFetching ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Current Image</p>
                {currentImage ? (
                  <Image
                    src={currentImage || "/placeholder.svg"}
                    alt="Current item image"
                    width={150}
                    height={150}
                    className="object-cover rounded-md"
                    fallback="/placeholder.svg?height=150&width=150"
                  />
                ) : (
                  <div className="w-[150px] h-[150px] bg-gray-200 flex items-center justify-center rounded-md">
                    No image
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  Upload New Image (Optional)
                </p>
                <ImageUploader onSuccess={(file) => setImageFile(file)} />
              </div>
            </div>

            <div>
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

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Update Item
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
}

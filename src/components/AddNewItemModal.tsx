"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { Form, Input, Select, Button, Typography, message, Modal } from "antd";
import { AddNewItem } from "@/lib/handler/api/itemsHandler";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function AddItemModal({ open, onClose }: any) {
  const router = useRouter();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  if (user?.role !== "superadmin") {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    await AddNewItem(values);
    setTimeout(() => {
      message.success("Equipment added successfully");
      setIsLoading(false);
      router.push("/dashboard/items");
    }, 1000);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="image"
            label="Image Link"
            rules={[
              {
                required: true,
                message: "Please enter the equipment name",
              },
            ]}
          >
            <Input placeholder="Enter Image Link" />
          </Form.Item>

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

        {/* <Form.Item
          name="description"
          label="Description"
          rules={[
            {
              required: true,
              message: "Please enter a description",
            },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Enter a detailed description of the equipment"
          />
        </Form.Item> */}

        <Form.Item className="flex justify-end">
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Add Equipment
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

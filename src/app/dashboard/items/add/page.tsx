"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { Card, Form, Input, Select, Button, Typography, message } from "antd";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function AddItemPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Redirect if not superadmin
  if (user?.role !== "superadmin") {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (values: any) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      message.success("Equipment added successfully");
      setLoading(false);
      router.push("/dashboard/items");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/items">
          <Button type="text" icon={<ArrowLeft size={16} />}>
            Back to Items
          </Button>
        </Link>
      </div>

      <Card variant="borderless">
        <Title level={4}>Add New Equipment</Title>
        <p className="text-gray-500 mb-6">
          Fill in the details to add new equipment to the inventory
        </p>

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
              name="category"
              label="Category"
              rules={[
                {
                  required: true,
                  message: "Please select a category",
                },
              ]}
            >
              <Select placeholder="Select a category">
                <Option value="Technology">Technology</Option>
                <Option value="Science">Science</Option>
                <Option value="Media">Media</Option>
                <Option value="Sports">Sports</Option>
                <Option value="Music">Music</Option>
                <Option value="Art">Art</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="serialNumber"
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
                <Option value="available">Available</Option>
                <Option value="pending">Pending</Option>
                <Option value="borrowed">Borrowed</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
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
          </Form.Item>

          <Form.Item className="flex justify-end">
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Equipment
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

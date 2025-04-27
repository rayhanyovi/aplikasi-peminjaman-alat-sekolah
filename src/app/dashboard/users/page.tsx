"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import {
  Table,
  Tag,
  Button,
  Input,
  Select,
  Typography,
  Space,
  Card,
  Modal,
  Form,
  message,
} from "antd";
import { Plus, Search, Mail, User } from "lucide-react";
import { users } from "@/dummy-data";

const { Title } = Typography;
const { Option } = Select;

export default function UsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Redirect if not superadmin
  if (user?.role !== "superadmin") {
    router.push("/dashboard");
    return null;
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter((u) => {
    const matchesSearch = searchText
      ? u.name.toLowerCase().includes(searchText.toLowerCase()) ||
        u.email.toLowerCase().includes(searchText.toLowerCase())
      : true;

    const matchesRole = roleFilter ? u.role === roleFilter : true;

    return matchesSearch && matchesRole;
  });

  const getRoleTag = (role: string) => {
    switch (role) {
      case "student":
        return <Tag color="blue">Student</Tag>;
      case "admin":
        return <Tag color="green">Admin</Tag>;
      case "superadmin":
        return <Tag color="red">Superadmin</Tag>;
      default:
        return <Tag>{role}</Tag>;
    }
  };

  const handleAddUser = async (values: any) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      message.success("User added successfully");
      setIsModalVisible(false);
      setLoading(false);
      form.resetFields();
    }, 1000);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-2">
          <User size={16} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <Mail size={16} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => getRoleTag(role),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" size="small">
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <Title level={4}>User Management</Title>
          <p className="text-gray-500">Manage users and their access levels</p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsModalVisible(true)}
        >
          Add User
        </Button>
      </div>

      <Card variant="borderless">
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by name or email"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<Search size={16} className="mr-1" />}
            className="max-w-md"
          />
          <Select
            placeholder="Role"
            allowClear
            style={{ minWidth: 120 }}
            onChange={(value) => setRoleFilter(value)}
            value={roleFilter}
          >
            <Option value="student">Student</Option>
            <Option value="admin">Admin</Option>
            <Option value="superadmin">Superadmin</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Add New User"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddUser}
          initialValues={{ role: "student" }}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              {
                required: true,
                message: "Please enter the user's name",
              },
            ]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: "Please enter the user's email",
              },
              {
                type: "email",
                message: "Please enter a valid email",
              },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[
              {
                required: true,
                message: "Please select a role",
              },
            ]}
          >
            <Select placeholder="Select a role">
              <Option value="student">Student</Option>
              <Option value="admin">Admin</Option>
              <Option value="superadmin">Superadmin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: "Please enter a password",
              },
              {
                min: 6,
                message: "Password must be at least 6 characters",
              },
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-2">
            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add User
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

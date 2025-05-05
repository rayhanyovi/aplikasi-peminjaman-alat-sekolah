"use client";

import { useEffect, useState } from "react";
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
  Upload,
  Spin,
} from "antd";
import { Plus, Search, Mail, User } from "lucide-react";
import { AddUser, GetUsers } from "@/lib/handler/api/userHandler";
// import "@ant-design/v5-patch-for-react-19";
import { handleCsvUpload } from "@/lib/helper/csvUploadHandler";


const { Title } = Typography;
const { Option } = Select;

interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [nameFilter, setNameFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [csvUsers, setCsvUsers] = useState<any[]>([]);

  useEffect(() => {
    handleGetUsers();
  }, [nameFilter, roleFilter, page, limit]);

  if (user?.role !== "superadmin") {
    router.push("/dashboard");
    return null;
  }

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
      case "siswa":
        return <Tag color="blue">Siswa</Tag>;
      case "admin":
        return <Tag color="green">Admin</Tag>;
      case "superadmin":
        return <Tag color="red">Superadmin</Tag>;
      default:
        return <Tag>{role}</Tag>;
    }
  };

  const handleAddUser = async (values: any) => {
    setIsLoading(true);
    try {
      const response = await AddUser(values.email, values.role, values.name);
      if (response.success) {
        message.success("User added successfully");
        handleGetUsers();
      }
    } catch (error: any) {
      message.error(error.message || "Error adding user");
    } finally {
      form.resetFields();
      setIsModalVisible(false);
      setIsLoading(false);
    }
  };

  const handleAddMultipleUsers = async (file: any) => {
    setUploadingCsv(true);
    let users = [];

    try {
      users = await handleCsvUpload(file);

      if (!users || users.length === 0) {
        message.error("No valid data found in the file!");
        setUploadingCsv(false);
        return;
      }

      // Add unique IDs to each user for tracking
      const usersWithIds = users.map((user: any, index) => ({
        ...user,
        id: `temp-${index}-${Date.now()}`,
        status: "Pending", // Initial status
      }));

      // Initialize csvUsers state with all users in 'Pending' status
      setCsvUsers(usersWithIds);

      // Process users one by one
      for (let i = 0; i < usersWithIds.length; i++) {
        const currentUser = usersWithIds[i];

        // Update status to Processing for current user
        setCsvUsers((prevUsers) =>
          prevUsers.map((user: any) =>
            user.id === currentUser.id
              ? { ...user, status: "Processing" }
              : user
          )
        );

        // Small delay to ensure UI updates
        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
          // Call API to add user
          const result = await AddUser(
            currentUser.email,
            currentUser.role,
            currentUser.name
          );

          // Update status based on result
          setCsvUsers((prevUsers) =>
            prevUsers.map((user: any) =>
              user.id === currentUser.id
                ? { ...user, status: result.success ? "Success" : "Failed" }
                : user
            )
          );
        } catch (error: any) {
          console.error(`Error adding user ${currentUser.name}:`, error);

          // Update status to Failed on error
          setCsvUsers((prevUsers) =>
            prevUsers.map((user: any) =>
              user.id === currentUser.id
                ? { ...user, status: "Failed", error: error.message }
                : user
            )
          );
        }
      }

      message.success(`Processed ${users.length} users from CSV`);
      handleGetUsers(); // Refresh the user list
    } catch (error: any) {
      console.error("Error during CSV upload:", error);
      message.error(error.message || "Error uploading CSV");
    }
  };

  const handleGetUsers = async () => {
    setIsLoading(true);
    const filters = {
      ...(nameFilter && { name: nameFilter }),
      ...(roleFilter && { role: roleFilter }),
    };
    try {
      const response = await GetUsers(page, limit, filters);

      if (response.next) {
        setHasNext(response.next);
      }
      if (response.success) {
        setUsers(response.data);
        setTotalUsers(response.count);
      }
    } catch (error: any) {
      message.error(error.message || "Error retrieving users");
    } finally {
      setIsLoading(false);
    }
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

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <Title level={4}>User Management</Title>
          <p className="text-gray-500">Manage users and their access levels</p>
        </div>
        <div className="flex flex-row gap-2">
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsModalVisible(true)}
          >
            Add User
          </Button>

          <Upload
            name="file"
            accept=".csv"
            showUploadList={false}
            customRequest={({ file, onSuccess }) => {
              onSuccess?.({}, file); // Menyelesaikan request upload
              handleAddMultipleUsers(file); // Memanggil fungsi untuk meng-handle file CSV
            }}
          >
            <Button type="primary" ghost loading={isLoading}>
              Import CSV
            </Button>
          </Upload>
        </div>
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
            <Option value="siswa">Student</Option>
            <Option value="admin">Admin</Option>
            <Option value="superadmin">Superadmin</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={csvUsers.length > 0 ? csvUsers : filteredUsers} // Show CSV progress or users list
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: limit,
            total: totalUsers,
          }}
          onChange={handleTableChange}
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
          initialValues={{ role: "siswa" }}
        >
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="Enter name" />
          </Form.Item>

          <Form.Item label="Email" name="email" rules={[{ required: true }]}>
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select>
              <Option value="siswa">Student</Option>
              <Option value="admin">Admin</Option>
              <Option value="superadmin">Superadmin</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end">
            <Button type="default" onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button
              className="ml-2"
              type="primary"
              htmlType="submit"
              loading={isLoading}
            >
              {isLoading ? "Adding..." : "Add User"}
            </Button>
          </div>
        </Form>
      </Modal>
      <Modal
        title="CSV Upload Progress"
        open={uploadingCsv}
        onCancel={() => setUploadingCsv(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setUploadingCsv(false)}
            type="primary"
          >
            Close
          </Button>,
        ]}
        width={650}
      >
        <div className="flex flex-col gap-6">
          {csvUsers.length > 0 ? (
            <div className="max-h-[460px] overflow-y-auto mt-8 border border-gray-300 px-4 rounded-xl">
              {csvUsers.map((user: any, index: number) => (
                <div
                  key={user.id}
                  className={`flex justify-between items-center p-4 border-gray-300 rounded-lg ${
                    index !== 0 ? "border-t" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="font-semibold text-lg">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getRoleTag(user.role)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {user.status === "Pending" && (
                      <Tag
                        color="default"
                        className="flex items-center space-x-1"
                      >
                        <i className="fas fa-clock text-sm"></i>
                        <span>Pending</span>
                      </Tag>
                    )}
                    {user.status === "Processing" && (
                      <div className="flex items-center space-x-2">
                        <Spin size="small" className="mr-2" />
                        <Tag
                          color="processing"
                          className="flex items-center space-x-1"
                        >
                          <i className="fas fa-spinner animate-spin text-sm"></i>
                          <span>Processing</span>
                        </Tag>
                      </div>
                    )}
                    {user.status === "Success" && (
                      <Tag
                        color="success"
                        className="flex items-center space-x-1"
                      >
                        <i className="fas fa-check-circle text-sm"></i>
                        <span>Success</span>
                      </Tag>
                    )}
                    {user.status === "Failed" && (
                      <div className="flex flex-col items-end space-x-2">
                        <Tag
                          color="error"
                          className="flex items-center space-x-1"
                        >
                          <i className="fas fa-times-circle text-sm"></i>
                          <span>Failed</span>
                        </Tag>
                        {user.error && (
                          <span className="text-xs text-red-500 mt-1 max-w-48 text-right">
                            {user.error}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center p-6">
              <Spin size="large" />
            </div>
          )}

          {csvUsers.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total: {csvUsers.length}</span>
                <span className="text-sm text-gray-600">
                  Success:{" "}
                  {csvUsers.filter((u) => u.status === "Success").length} |
                  Failed: {csvUsers.filter((u) => u.status === "Failed").length}{" "}
                  | Pending:{" "}
                  {
                    csvUsers.filter(
                      (u) => u.status === "Pending" || u.status === "Processing"
                    ).length
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

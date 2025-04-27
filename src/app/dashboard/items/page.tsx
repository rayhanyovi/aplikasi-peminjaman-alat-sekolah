"use client";

import { useState } from "react";
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
} from "antd";
import { Plus, Search } from "lucide-react";
import { items } from "@/dummy-data";
import Link from "next/link";

const { Title } = Typography;
const { Option } = Select;

export default function ItemsPage() {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Get unique categories for filter
  const categories = Array.from(new Set(items.map((item) => item.category)));

  const getStatusTag = (status: string) => {
    switch (status) {
      case "available":
        return <Tag color="green">Available</Tag>;
      case "pending":
        return <Tag color="orange">Pending</Tag>;
      case "borrowed":
        return <Tag color="blue">Borrowed</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // Filter items based on search and filters
  const filteredItems = items.filter((item) => {
    const matchesSearch = searchText
      ? item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchText.toLowerCase())
      : true;

    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesCategory = categoryFilter
      ? item.category === categoryFilter
      : true;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <Link href={`/dashboard/items/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Serial Number",
      dataIndex: "serialNumber",
      key: "serialNumber",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="small">
          <Link href={`/dashboard/items/${record.id}`}>
            <Button type="link" size="small">
              {user?.role === "student" && record.status === "available"
                ? "Borrow"
                : "View"}
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <Title level={4}>Equipment Inventory</Title>
          <p className="text-gray-500">Browse and manage school equipment</p>
        </div>
        {user?.role === "superadmin" && (
          <Link href="/dashboard/items/add">
            <Button type="primary" icon={<Plus size={16} />}>
              Add Equipment
            </Button>
          </Link>
        )}
      </div>

      <Card variant="borderless">
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by name, description or serial number"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<Search size={16} className="mr-1" />}
            className="max-w-md"
          />
          <div className="flex gap-2">
            <Select
              placeholder="Status"
              allowClear
              style={{ minWidth: 120 }}
              onChange={(value) => setStatusFilter(value)}
              value={statusFilter}
            >
              <Option value="available">Available</Option>
              <Option value="pending">Pending</Option>
              <Option value="borrowed">Borrowed</Option>
            </Select>
            <Select
              placeholder="Category"
              allowClear
              style={{ minWidth: 120 }}
              onChange={(value) => setCategoryFilter(value)}
              value={categoryFilter}
            >
              {categories.map((category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}

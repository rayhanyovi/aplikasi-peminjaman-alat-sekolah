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
import type { ColumnsType } from "antd/es/table";
import { Search } from "lucide-react";
import Link from "next/link";
import { requests, getItemById, getUserById } from "@/dummy-data";

interface Request {
  id: string;
  itemId: string;
  userId: string;
  requestDate: string;
  dueDate: string;
  status: string;
}

const { Title } = Typography;
const { Option } = Select;

export default function RequestsPage() {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Filter requests based on user role
  const userRequests =
    user?.role === "student"
      ? requests.filter((req) => req.userId === user.id)
      : requests;

  // Filter requests based on search and filters
  const filteredRequests = userRequests.filter((request) => {
    const item = getItemById(request.itemId);
    const requester = getUserById(request.userId);

    const matchesSearch = searchText
      ? item?.name.toLowerCase().includes(searchText.toLowerCase()) ||
        requester?.name.toLowerCase().includes(searchText.toLowerCase()) ||
        request.requestDate.toLowerCase().includes(searchText.toLowerCase())
      : true;

    const matchesStatus = statusFilter ? request.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  const getStatusTag = (status: string) => {
    switch (status) {
      case "pending":
        return <Tag color="orange">Pending</Tag>;
      case "approved":
        return <Tag color="green">Approved</Tag>;
      case "rejected":
        return <Tag color="red">Rejected</Tag>;
      case "returned":
        return <Tag color="gray">Returned</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns: ColumnsType<Request> = [
    {
      title: "Equipment",
      dataIndex: "itemId",
      key: "item",
      render: (itemId: string) => {
        const item = getItemById(itemId);
        return item ? item.name : "Unknown Item";
      },
    },
    {
      title: "Request Date",
      dataIndex: "requestDate",
      key: "requestDate",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
  ];

  // Add requester column for admin/superadmin
  if (user?.role !== "student") {
    columns.splice(1, 0, {
      title: "Requester",
      dataIndex: "userId",
      key: "requester",
      render: (userId: string) => {
        const requester = getUserById(userId);
        return requester ? requester.name : "Unknown User";
      },
    });
  }

  // Add due date column for approved requests
  columns.push({
    title: "Due Date",
    dataIndex: "dueDate",
    key: "dueDate",
    render: (dueDate: string) => dueDate || "-",
  });

  // Add action column
  columns.push({
    title: "Action",
    key: "action",
    render: (_: any, record: any) => (
      <Space size="small">
        <Link href={`/dashboard/requests/${record.id}`}>
          <Button type="link" size="small">
            {user?.role !== "student" && record.status === "pending"
              ? "Review"
              : "View"}
          </Button>
        </Link>
      </Space>
    ),
  });

  return (
    <div className="space-y-6">
      <div>
        <Title level={4}>
          {user?.role === "student" ? "My Requests" : "Borrow Requests"}
        </Title>
        <p className="text-gray-500">
          {user?.role === "student"
            ? "View and manage your equipment borrow requests"
            : "Review and manage equipment borrow requests"}
        </p>
      </div>

      <Card variant="borderless">
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by equipment or date"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<Search size={16} className="mr-1" />}
            className="max-w-md"
          />
          <Select
            placeholder="Status"
            allowClear
            style={{ minWidth: 120 }}
            onChange={(value) => setStatusFilter(value)}
            value={statusFilter}
          >
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="returned">Returned</Option>
          </Select>
        </div>

        <Table
          columns={columns as ColumnsType<(typeof filteredRequests)[number]>}
          dataSource={filteredRequests}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}

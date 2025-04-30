"use client";

import { useEffect, useState } from "react";
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
import { GetLoans } from "@/lib/handler/api/loansHandler";
import { UserProfilesType } from "@/types/userTypes";
import { Item } from "@/types/itemTypes";
import dayjs from "dayjs";

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setIsLoading] = useState(true);
  const [loanRequest, setLoanRequest] = useState<Request[]>([]);

  useEffect(() => {
    fetchLoanRequest();
  }, []);

  const fetchLoanRequest = async () => {
    try {
      const response = await GetLoans("pending", page, limit);
      if (response.success) {
        setLoanRequest(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter requests based on user role
  const userRequests =
    user?.role === "student"
      ? requests.filter((req) => req.userId === user.id)
      : requests;

  // Filter requests based on search and filters
  // const filteredRequests = userRequests.filter((request) => {
  //   const item = getItemById(request.itemId);
  //   const requester = getUserById(request.userId);

  //   const matchesSearch = searchText
  //     ? item?.name.toLowerCase().includes(searchText.toLowerCase()) ||
  //       requester?.name.toLowerCase().includes(searchText.toLowerCase()) ||
  //       request.requestDate.toLowerCase().includes(searchText.toLowerCase())
  //     : true;

  //   const matchesStatus = statusFilter ? request.status === statusFilter : true;

  //   return matchesSearch && matchesStatus;
  // });

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
      dataIndex: "items",
      key: "item",
      render: (item: Item) => {
        return item ? item.name : "Unknown Item";
      },
    },
    {
      title: "Request Date",
      dataIndex: "requested_at",
      key: "requestDate",
      render: (date: string) => dayjs(date).format("dddd, DD MMMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
  ];

  if (user?.role !== "student") {
    columns.splice(1, 0, {
      title: "Requester",
      dataIndex: "student",
      key: "requester",
      render: (student: UserProfilesType) => {
        return <p onClick={() => console.log(loanRequest)}>{student.name}</p>;

        // return requester ? requester.student.name : "Unknown User";
      },
    });
  }

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
        </div>

        <Table
          columns={columns}
          dataSource={loanRequest}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}

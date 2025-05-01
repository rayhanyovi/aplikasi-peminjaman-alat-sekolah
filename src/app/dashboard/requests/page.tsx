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
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ApproveLoan,
  GetLoans,
  RejectLoan,
  ReturnLoan,
} from "@/lib/handler/api/loansHandler";
import { UserProfilesType } from "@/types/userTypes";
import { Item } from "@/types/itemTypes";
import dayjs from "dayjs";
import LoanRequestDetailModal from "@/components/LoanRequestDetailModal";
import LoanRejectModal from "@/components/LoanRejectModal";
// import "@ant-design/v5-patch-for-react-19";
import { stat } from "fs";
import LoanReturnModal from "@/components/LoanReturnModal";

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
  const router = useRouter();
  const { user } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [loanRequest, setLoanRequest] = useState<Request[]>([]);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
  const [isRequestDetailModalVisible, setIsRequestDetailModalVisible] =
    useState(false);

  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchLoanRequest();
  }, []);

  const fetchLoanRequest = async () => {
    try {
      const response = await GetLoans(page, limit, {
        status: "approved,pending",
      });
      if (response.success) {
        setLoanRequest(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const response = await ApproveLoan({
        itemId: selectedItem.item_id,
      });
      if (response.success) {
        message.success("Loan approved successfully");
        setIsLoading(false);
        loanRequest.splice(loanRequest.indexOf(selectedItem), 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (values: any) => {
    setIsLoading(true);
    try {
      const response = await RejectLoan({
        itemId: selectedItem.item_id,
        rejectionNote: values.payload,
      });
      if (response.success) {
        message.success("Loan rejected successfully");
        setIsRejectModalVisible(false);
        loanRequest.splice(loanRequest.indexOf(selectedItem), 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async (values: any) => {
    setIsLoading(true);
    try {
      const response = await ReturnLoan({
        itemId: selectedItem.item_id,
        returnNote: values.payload,
      });
      if (response.success) {
        message.success("Loan returned successfully");
        setIsRejectModalVisible(false);
        loanRequest.splice(loanRequest.indexOf(selectedItem), 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
        return <p>{student.name}</p>;

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
        <Button
          type="link"
          size="small"
          onClick={() => {
            setIsRequestDetailModalVisible(true);
            setSelectedItem(record);
          }}
        >
          Details
        </Button>
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
          loading={isLoading}
        />
      </Card>

      <LoanRequestDetailModal
        open={isRequestDetailModalVisible}
        onClose={(status: "reject" | "accept" | "return") => {
          if (status === "reject") {
            setIsRejectModalVisible(true);
          } else if (status === "accept") {
            handleApprove();
          } else if (status === "return") {
            setIsReturnModalVisible(true);
          }

          setIsRequestDetailModalVisible(false);
        }}
        item={selectedItem}
      />

      <LoanRejectModal
        open={isRejectModalVisible}
        onClose={(payload?: any) => {
          setIsRejectModalVisible(false);
          if (payload) {
            handleReject(payload);
          }
        }}
        item={selectedItem}
      />

      <LoanReturnModal
        open={isRejectModalVisible}
        onClose={(payload?: any) => {
          setIsReturnModalVisible(false);
          if (payload) {
            handleReturn(payload);
          }
        }}
        item={selectedItem}
      />
    </div>
  );
}

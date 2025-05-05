"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import {
  Table,
  Input,
  Typography,
  Card,
  DatePicker,
  Select,
  Button,
  message,
} from "antd";
import { Search } from "lucide-react";
import Link from "next/link";
import {
  ApproveLoan,
  GetLoans,
  GetLoansHistory,
  RejectLoan,
  ReturnLoan,
} from "@/lib/handler/api/loansHandler";
// import "@ant-design/v5-patch-for-react-19";
import { getStatusTag } from "@/lib/helper/getStatusTag";
import dayjs from "dayjs";
import LoanRequestDetailModal from "@/components/LoanRequestDetailModal";
import LoanRejectModal from "@/components/LoanRejectModal";
import LoanReturnModal from "@/components/LoanReturnModal";
import { useRouter } from "next/navigation";

// import { history, getItemById, getUserById } from "@/dummy-data";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isRequestDetailModalVisible, setIsRequestDetailModalVisible] =
    useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<any>(null);
  const [histories, setHistories] = useState<any>([]);

  useEffect(() => {
    fetchLoanHistory();
  }, [page, limit, searchText, dateRange, status]);

  const fetchLoanHistory = async () => {
    setIsLoading(true);
    try {
      const response = await GetLoans(page, limit, {
        status: status || undefined,
        name: searchText || undefined,
        startDate: dateRange?.[0]?.toDate(),
        endDate: dateRange?.[1]?.toDate(),
      });
      if (response.success) {
        setHistories(response.data);
        setTotal(response.count);
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
        router.refresh();
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
        router.refresh();
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
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      title: "Equipment",
      dataIndex: "item_id",
      key: "item_id",
      render: (record: any) => {
        const item = histories.find((item: any) => item.item_id === record);
        return item ? (
          <Link href={`/dashboard/items/${record}`}>{item.items.name}</Link>
        ) : (
          "Unknown Item"
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Borrow Date",
      dataIndex: "approved_at",
      key: "borrowDate",
      render: (date: string) =>
        date ? dayjs(date).format("dddd, DD MMMM YYYY") : "-",
    },
    {
      title: "Return Date",
      dataIndex: "returned_at",
      key: "returnDate",
      render: (date: string) =>
        date ? dayjs(date).format("dddd, DD MMMM YYYY") : "-",
    },
    {
      title: "Action",
      dataIndex: "item_id",
      key: "notes",
      render: (record: any) => {
        const item = histories.find((item: any) => item.item_id === record);
        return (
          <Button
            type="link"
            onClick={() => {
              console.log(item);
              setSelectedItem(item);
              setIsRequestDetailModalVisible(true);
            }}
          >
            Details
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <p onClick={() => console.log(histories)}>asdasd</p>
      <div>
        <Title level={4}>Borrowing History</Title>
        <p className="text-gray-500">View the history of equipment borrowing</p>
      </div>

      <Card variant="borderless">
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by equipment, user, or notes"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<Search size={16} className="mr-1" />}
            className="max-w-md"
          />

          <Select
            placeholder="Status"
            className="w-28"
            allowClear
            onChange={(value) => setStatus(value)}
            value={status}
          >
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="approved">Approved</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
            <Select.Option value="returned">Returned</Select.Option>
          </Select>

          <RangePicker
            disabled
            onChange={(dates) => setDateRange(dates)}
            placeholder={["Start Date", "End Date"]}
          />
        </div>

        <Table
          columns={columns}
          loading={isLoading}
          dataSource={histories}
          rowKey="id"
          pagination={{
            onChange(page, pageSize) {
              setPage(page);
              setLimit(pageSize);
            },
            total: total,
            defaultPageSize: 10,
          }}
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
        open={isReturnModalVisible}
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

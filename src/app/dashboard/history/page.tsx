"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { Table, Input, Typography, Card, DatePicker, Select } from "antd";
import { Search } from "lucide-react";
import Link from "next/link";
import { GetLoans, GetLoansHistory } from "@/lib/handler/api/loansHandler";
import "@ant-design/v5-patch-for-react-19";
import { getStatusTag } from "@/lib/helper/getStatusTag";
import dayjs from "dayjs";

// import { history, getItemById, getUserById } from "@/dummy-data";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function HistoryPage() {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState();
  const [dateRange, setDateRange] = useState<any>(null);
  const [histories, setHistories] = useState<any>([]);

  useEffect(() => {
    fetchLoanHistory();
  }, [page, limit, searchText, dateRange, status]);

  const fetchLoanHistory = async () => {
    setIsLoading(true);
    try {
      const response = await GetLoansHistory(page, limit, {
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
      dataIndex: "id",
      key: "notes",
      render: (record: any) => {
        return <Link href={`/dashboard/items/${record}`}>Details</Link>;
      },
    },
  ];

  return (
    <div className="space-y-6">
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
            defaultPageSize: 20,
          }}
        />
      </Card>
    </div>
  );
}

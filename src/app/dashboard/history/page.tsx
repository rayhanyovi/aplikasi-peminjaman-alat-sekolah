"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { Table, Input, Typography, Card, DatePicker } from "antd";
import { Search } from "lucide-react";
import Link from "next/link";
import { GetLoans, GetLoansHistory } from "@/lib/handler/api/loansHandler";
import "@ant-design/v5-patch-for-react-19";

// import { history, getItemById, getUserById } from "@/dummy-data";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function HistoryPage() {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateRange, setDateRange] = useState<any>(null);
  const [histories, setHistories] = useState<any>([]);

  useEffect(() => {
    fetchLoanHistory();
  }, []);

  const fetchLoanHistory = async () => {
    try {
      const response = await GetLoansHistory(undefined, page, limit);
      if (response.success) {
        setHistories(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // const filteredHistory = history.filter((record) => {
  //   const item = getItemById(record.itemId);
  //   const borrower = getUserById(record.userId);

  //   // For students, only show history without user info
  //   if (user?.role === "student") {
  //     const matchesSearch = searchText
  //       ? item?.name.toLowerCase().includes(searchText.toLowerCase()) ||
  //         record.borrowDate.includes(searchText) ||
  //         record.returnDate?.includes(searchText) ||
  //         record.notes?.toLowerCase().includes(searchText.toLowerCase())
  //       : true;

  //     return matchesSearch;
  //   }

  //   // For admin/superadmin, show all history with user info
  //   const matchesSearch = searchText
  //     ? item?.name.toLowerCase().includes(searchText.toLowerCase()) ||
  //       borrower?.name.toLowerCase().includes(searchText.toLowerCase()) ||
  //       record.borrowDate.includes(searchText) ||
  //       record.returnDate?.includes(searchText) ||
  //       record.notes?.toLowerCase().includes(searchText.toLowerCase())
  //     : true;

  //   return matchesSearch;
  // });

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
          // <p onClick={() => console.log(item)}>{record}</p>
          "Unknown Item"
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Borrow Date",
      dataIndex: "approved_at",
      key: "borrowDate",
    },
    {
      title: "Return Date",
      dataIndex: "returned_at",
      key: "returnDate",
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
          <RangePicker
            onChange={(dates) => setDateRange(dates)}
            placeholder={["Start Date", "End Date"]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={histories}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}

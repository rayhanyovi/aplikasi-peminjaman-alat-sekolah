"use client";

import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { Table, Input, Typography, Card, DatePicker } from "antd";
import { Search } from "lucide-react";
import Link from "next/link";
import { history, getItemById, getUserById } from "@/dummy-data";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function HistoryPage() {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);

  // Filter history based on user role
  const filteredHistory = history.filter((record) => {
    const item = getItemById(record.itemId);
    const borrower = getUserById(record.userId);

    // For students, only show history without user info
    if (user?.role === "student") {
      const matchesSearch = searchText
        ? item?.name.toLowerCase().includes(searchText.toLowerCase()) ||
          record.borrowDate.includes(searchText) ||
          record.returnDate?.includes(searchText) ||
          record.notes?.toLowerCase().includes(searchText.toLowerCase())
        : true;

      return matchesSearch;
    }

    // For admin/superadmin, show all history with user info
    const matchesSearch = searchText
      ? item?.name.toLowerCase().includes(searchText.toLowerCase()) ||
        borrower?.name.toLowerCase().includes(searchText.toLowerCase()) ||
        record.borrowDate.includes(searchText) ||
        record.returnDate?.includes(searchText) ||
        record.notes?.toLowerCase().includes(searchText.toLowerCase())
      : true;

    return matchesSearch;
  });

  const columns = [
    {
      title: "Equipment",
      dataIndex: "itemId",
      key: "item",
      render: (itemId: string) => {
        const item = getItemById(itemId);
        return item ? (
          <Link href={`/dashboard/items/${itemId}`}>{item.name}</Link>
        ) : (
          "Unknown Item"
        );
      },
    },
    {
      title: "Borrow Date",
      dataIndex: "borrowDate",
      key: "borrowDate",
    },
    {
      title: "Return Date",
      dataIndex: "returnDate",
      key: "returnDate",
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => notes || "-",
    },
  ];

  // Add borrower column for admin/superadmin
  if (user?.role !== "student") {
    columns.splice(1, 0, {
      title: "Borrowed By",
      dataIndex: "userId",
      key: "borrower",
      render: (userId: string) => {
        const borrower = getUserById(userId);
        return borrower ? borrower.name : "Unknown User";
      },
    });
  }

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
          dataSource={filteredHistory}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}

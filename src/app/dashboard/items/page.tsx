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
import { Plus, Search } from "lucide-react";
import { items } from "@/dummy-data";
import Link from "next/link";
import { getStatusTag } from "@/lib/helper/getStatusTag";
import { GetItems } from "@/lib/handler/api/itemsHandler";
import Loading from "./loading";
import { useParams, useRouter } from "next/navigation";
import ItemDetailModal from "@/components/ItemDetailsModal";
import AddItemModal from "@/components/AddNewItemModal";
import "@ant-design/v5-patch-for-react-19";

const { Title } = Typography;
const { Option } = Select;

export default function ItemsPage() {
  const params = useParams();
  const router = useRouter();

  const itemId = params?.id;

  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  // const [isItemDetailModalOpen, setIsItemDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    GetAllItems();
  }, [statusFilter]);

  const handleOpenModal = (id: string) => {
    // setIsItemDetailModalOpen(true);
    router.push(`/dashboard/items/${id}`);
  };

  const handleCloseModal = () => {
    // setIsItemDetailModalOpen(false);
    router.push("/dashboard/items"); // Balikin URL pas modal ditutup
  };

  const isItemDetailModalOpen = !!itemId; // Kalau ada ID di URL, modal otomatis kebuka

  const GetAllItems = async () => {
    setIsLoading(true);
    await GetItems(statusFilter ?? "", 1, 10)
      .then((v) => setItems(v.data)) // Ensure the response is the correct type
      .catch((e) => message.error(e))
      .finally(() => setIsLoading(false)); // Fix to set loading state to false when done
  };
  const filteredItems = items.filter((item) => {
    if (searchText) {
      return item.name.toLowerCase().includes(searchText.toLowerCase());
    } else {
      return items;
    }
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <p onClick={() => handleOpenModal(record.id)}>{text}</p>
      ),
    },

    {
      title: "Serial Number",
      dataIndex: "code",
      key: "code",
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
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsAddItemModalOpen(true)}
          >
            Add Equipment
          </Button>
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
              <Option value="tersedia">Tersedia</Option>
              <Option value="pending">Pending</Option>
              <Option value="dipinjam">Dipinjam</Option>
            </Select>
          </div>
        </div>

        <Table
          loading={isLoading}
          columns={columns}
          dataSource={filteredItems}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <ItemDetailModal
        open={isItemDetailModalOpen}
        onClose={handleCloseModal}
        itemId={itemId?.toString() ?? ""}
      />

      <AddItemModal open={isAddItemModalOpen} onClose={setIsAddItemModalOpen} />
    </div>
  );
}

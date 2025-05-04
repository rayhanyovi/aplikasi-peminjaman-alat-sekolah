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
  Upload,
  Modal,
  Spin,
} from "antd";
import { Plus, Search } from "lucide-react";
import { items } from "@/dummy-data";
import Link from "next/link";
import { getStatusTag } from "@/lib/helper/getStatusTag";
import { AddNewItem, GetItems } from "@/lib/handler/api/itemsHandler";
import Loading from "./loading";
import { useParams, useRouter } from "next/navigation";
import ItemDetailModal from "@/components/ItemDetailsModal";
import AddItemModal from "@/components/AddNewItemModal";
import "@ant-design/v5-patch-for-react-19";
import { handleItemsCsvUpload } from "@/lib/helper/csvItemsUploadHandler";
import { uploadImageFromUrl } from "@/lib/handler/api/imageHandler";

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [csvItems, setCsvItems] = useState<any[]>([]);

  useEffect(() => {
    GetAllItems();
  }, [statusFilter, page, limit]);

  const handleOpenModal = (id: string) => {
    // setIsItemDetailModalOpen(true);
    router.push(`/dashboard/items/${id}`);
  };

  const handleCloseModal = () => {
    router.push("/dashboard/items");
  };

  const isItemDetailModalOpen = !!itemId;

  const GetAllItems = async () => {
    setIsLoading(true);
    await GetItems(statusFilter ?? "", page, limit)
      .then((v) => {
        setItems(v.data);
        setTotal(v.count);
      }) // Ensure the response is the correct type
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

  const handleAddMultipleItems = async (file: any) => {
    setUploadingCsv(true);
    let items = [];

    try {
      items = await handleItemsCsvUpload(file);

      if (!items || items.length === 0) {
        message.error("No valid data found in the file!");
        setUploadingCsv(false);
        return;
      }

      // Add unique IDs to each item for tracking
      const itemsWithIds = items.map((item: any, index) => ({
        ...item,
        id: `temp-${index}-${Date.now()}`,
        status: "Pending", // Initial status
      }));

      // Initialize csvItems state with all items in 'Pending' status
      setCsvItems(itemsWithIds);

      // Process items one by one
      for (let i = 0; i < itemsWithIds.length; i++) {
        const currentItem = itemsWithIds[i];

        // Update status to Processing for current item
        setCsvItems((prevItems) =>
          prevItems.map((item: any) =>
            item.id === currentItem.id
              ? { ...item, status: "Processing" }
              : item
          )
        );

        // Small delay to ensure UI updates
        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
          // Process image if URL is provided
          let imageUrl = "https://placehold.co/600x600/webp";

          if (currentItem.image) {
            setCsvItems((prevItems) =>
              prevItems.map((item: any) =>
                item.id === currentItem.id
                  ? { ...item, status: "Processing Image" }
                  : item
              )
            );

            const imageResult = await uploadImageFromUrl(currentItem.image);
            if (imageResult.success && imageResult.url) {
              imageUrl = imageResult.url;
            }
          }

          // Call API to add item
          const result = await AddNewItem({
            name: currentItem.name,
            code: currentItem.code,
            image: imageUrl,
          });

          // Update status based on result
          setCsvItems((prevItems) =>
            prevItems.map((item: any) =>
              item.id === currentItem.id
                ? { ...item, status: result.success ? "Success" : "Failed" }
                : item
            )
          );
        } catch (error: any) {
          console.error(`Error adding item ${currentItem.name}:`, error);

          // Update status to Failed on error
          setCsvItems((prevItems) =>
            prevItems.map((item: any) =>
              item.id === currentItem.id
                ? { ...item, status: "Failed", error: error.message }
                : item
            )
          );
        }
      }

      message.success(`Processed ${items.length} items from CSV`);
      GetAllItems(); // Refresh the item list
    } catch (error: any) {
      console.error("Error during CSV upload:", error);
      message.error(error.message || "Error uploading CSV");
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
          <div className="flex flex-row gap-4">
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsAddItemModalOpen(true)}
            >
              Add Equipment
            </Button>
            <Upload
              name="file"
              accept=".csv"
              showUploadList={false}
              customRequest={({ file, onSuccess }) => {
                onSuccess?.({}, file); // Menyelesaikan request upload
                handleAddMultipleItems(file); // Memanggil fungsi untuk meng-handle file CSV
              }}
            >
              <Button type="primary" ghost loading={isLoading}>
                Import CSV
              </Button>
            </Upload>
          </div>
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

      <ItemDetailModal
        open={isItemDetailModalOpen}
        onClose={handleCloseModal}
        itemId={itemId?.toString() ?? ""}
      />

      <AddItemModal open={isAddItemModalOpen} onClose={setIsAddItemModalOpen} />

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
          {csvItems.length > 0 ? (
            <div className="max-h-[460px] overflow-y-auto mt-8 border border-gray-300 px-4 rounded-xl">
              {csvItems.map((item: any, index: number) => (
                <div
                  key={item.id}
                  className={`flex justify-between items-center p-4 border-gray-300 rounded-lg ${
                    index !== 0 ? "border-t" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="font-semibold text-lg">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      Code: {item.code}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {item.status === "Pending" && (
                      <Tag
                        color="default"
                        className="flex items-center space-x-1"
                      >
                        <span>Pending</span>
                      </Tag>
                    )}
                    {item.status === "Processing" && (
                      <div className="flex items-center space-x-2">
                        <Spin size="small" className="mr-2" />
                        <Tag
                          color="processing"
                          className="flex items-center space-x-1"
                        >
                          <span>Processing</span>
                        </Tag>
                      </div>
                    )}
                    {item.status === "Success" && (
                      <Tag
                        color="success"
                        className="flex items-center space-x-1"
                      >
                        <span>Success</span>
                      </Tag>
                    )}
                    {item.status === "Failed" && (
                      <div className="flex flex-col items-end space-x-2">
                        <Tag
                          color="error"
                          className="flex items-center space-x-1"
                        >
                          <span>Failed</span>
                        </Tag>
                        {item.error && (
                          <span className="text-xs text-red-500 mt-1 max-w-48 text-right">
                            {item.error}
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

          {csvItems.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total: {csvItems.length}</span>
                <span className="text-sm text-gray-600">
                  Success:{" "}
                  {csvItems.filter((i) => i.status === "Success").length} |
                  Failed: {csvItems.filter((i) => i.status === "Failed").length}{" "}
                  | Pending:{" "}
                  {
                    csvItems.filter(
                      (i) => i.status === "Pending" || i.status === "Processing"
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

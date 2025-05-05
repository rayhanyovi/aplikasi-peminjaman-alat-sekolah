"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Tabs,
  List,
  Form,
  Input,
  message,
  Typography,
  Divider,
  Spin,
  Image,
  Space,
} from "antd";
import dayjs from "dayjs";
import { ArrowLeft, Clock, Edit, Save, X } from "lucide-react";
import Link from "next/link";
import { GetItemDetails, UpdateItem } from "@/lib/handler/api/itemsHandler";
import type { HistoryRecords } from "@/types/itemTypes";
import LoanRequestModal from "@/components/LoanRequestModal";
import ImageUploader from "@/components/ImageUploader";
import { uploadImageHandler } from "@/lib/handler/api/imageHandler";

const { Title, Text } = Typography;

export default function ItemDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [itemData, setItemData] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const itemId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  const fetchItem = async () => {
    if (!itemId) return;

    setFetching(true);
    try {
      const res = await GetItemDetails(itemId);
      if (res.success) {
        setItemData(res.data);
        // Initialize form with current values
        form.setFieldsValue({
          name: res.data.item.name,
          code: res.data.item.code,
        });
      } else {
        message.error(res.error || "Failed to fetch item details");
      }
    } catch (err) {
      console.error(err);
      message.error("Error fetching item details");
    } finally {
      setFetching(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      let imageUrl = itemData.item.image;

      if (itemId === undefined) {
        throw new Error("Item ID is required");
      }

      if (imageFile) {
        const uploadResponse = await uploadImageHandler(
          imageFile,
          "item",
          itemId
        );
        if (uploadResponse.success) {
          imageUrl = uploadResponse.url;
        } else {
          throw new Error("Failed to upload image");
        }
      }

      if (!itemId) throw new Error("Item ID is required");

      const updateData = {
        name: values.name,
        code: values.code,
        image: imageUrl,
      };

      const response = await UpdateItem(itemId, updateData);

      if (response.success) {
        message.success("Item updated successfully");
        setIsEditMode(false);
        fetchItem(); // Refresh the data
      } else {
        throw new Error(response.error || "Failed to update item");
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.message || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setImageFile(null);
    // Reset form to original values
    form.setFieldsValue({
      name: itemData.item.name,
      code: itemData.item.code,
    });
  };

  if (!itemId) {
    return (
      <div className="text-center py-10">
        <Title level={4}>Invalid item ID</Title>
        <Link href="/dashboard/items">
          <Button type="primary">Back to Items</Button>
        </Link>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!itemData) {
    return (
      <div className="text-center py-10">
        <Title level={4}>Item not found</Title>
        <Link href="/dashboard/items">
          <Button type="primary">Back to Items</Button>
        </Link>
      </div>
    );
  }

  const { item, current_request, history } = itemData;

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

  const handleBorrowRequest = () => {
    setIsModalVisible(true);
  };

  const items = [
    {
      key: "history",
      label: (
        <span className="flex items-center gap-1">
          <Clock size={16} />
          Borrowing History
        </span>
      ),
      children: (
        <List
          dataSource={history}
          renderItem={(record: HistoryRecords) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <span>Borrowed by {record.borrower.name || "Unknown"}</span>
                }
                description={
                  <div>
                    <div>
                      Borrow Date:{" "}
                      {dayjs(record.approved_at).format("dddd, DD MMMM YYYY") ||
                        "-"}
                      <br />
                      Return Date:{" "}
                      {dayjs(record.returned_at).format("dddd, DD MMMM YYYY") ||
                        "-"}
                    </div>
                    {record.return_note && (
                      <div className="mt-1">
                        <Text strong>Notes: </Text>
                        {record.return_note}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: "No borrowing history for this item",
          }}
        />
      ),
    },
  ];

  if (user?.role === "admin" || user?.role === "superadmin") {
    items.push({
      key: "requests",
      label: (
        <span className="flex items-center gap-1">
          <Clock size={16} />
          Current Situation
        </span>
      ),
      children: (
        <List
          dataSource={current_request}
          renderItem={(request: any) => (
            <List.Item
              actions={[
                <Link key="review" href={`/dashboard/requests/${request.id}`}>
                  <Button type="link">Review</Button>
                </Link>,
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center gap-2">
                    <span>Request by {request.userName || "Unknown"}</span>
                    <Tag
                      color={request.status === "pending" ? "orange" : "green"}
                    >
                      {request.status}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <div>Request Date: {request.requestDate || "-"}</div>
                    {request.dueDate && <div>Due Date: {request.dueDate}</div>}
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: "No active requests for this item",
          }}
        />
      ),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/items">
          <Button type="text" icon={<ArrowLeft size={16} />}>
            Back to Items
          </Button>
        </Link>

        {user?.role === "superadmin" && !isEditMode && (
          <Button
            type="primary"
            icon={<Edit size={16} />}
            onClick={() => setIsEditMode(true)}
          >
            Edit Item
          </Button>
        )}

        {isEditMode && (
          <Space>
            <Button
              type="default"
              icon={<X size={16} />}
              onClick={handleCancelEdit}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<Save size={16} />}
              onClick={handleSaveChanges}
              loading={loading}
            >
              Save Changes
            </Button>
          </Space>
        )}
      </div>

      <Card variant="borderless">
        <Form form={form} layout="vertical">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            {isEditMode ? (
              <div className="flex flex-col items-center md:!max-w-72">
                <div className="mb-4">
                  {/* <p className="text-sm text-gray-500 mb-2">Current Image</p> */}
                  <ImageUploader
                    existedFileList={[
                      {
                        uid: item.image,
                        name: item.name,
                        status: "done",
                        url: item.image,
                      },
                    ]}
                    size={288}
                    onSuccess={(file) => setImageFile(file)}
                  />
                </div>
              </div>
            ) : (
              <Image
                src={item.image || "/placeholder.svg"}
                alt="item"
                className="flex !w-full md:!max-w-72 !aspect-square object-cover"
              />
            )}

            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 flex-1">
              <div className="flex-1">
                {isEditMode ? (
                  <div className="space-y-4">
                    <Form.Item
                      name="name"
                      label="Equipment Name"
                      rules={[
                        {
                          required: true,
                          message: "Please enter equipment name",
                        },
                      ]}
                    >
                      <Input placeholder="Enter equipment name" />
                    </Form.Item>

                    <Form.Item
                      name="code"
                      label="Serial Number"
                      rules={[
                        {
                          required: true,
                          message: "Please enter serial number",
                        },
                      ]}
                    >
                      <Input placeholder="Enter serial number" />
                    </Form.Item>
                  </div>
                ) : (
                  <>
                    <Title level={4}>{item.name}</Title>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusTag(item.status)}
                    </div>
                    <Text type="secondary">Serial Number: {item.code}</Text>
                  </>
                )}
              </div>

              {user?.role === "siswa" &&
                item.status === "tersedia" &&
                !isEditMode && (
                  <Button type="primary" onClick={handleBorrowRequest}>
                    Request to Borrow
                  </Button>
                )}
            </div>
          </div>
        </Form>

        <Divider />

        <Descriptions title="Equipment Details" layout="vertical" bordered>
          <Descriptions.Item label="Description" span={3}>
            {item.description || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Added By">
            {item.addedBy || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Added Date">
            {item.addedDate || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {getStatusTag(item.status)}
          </Descriptions.Item>
        </Descriptions>

        <Tabs defaultActiveKey="history" className="mt-6" items={items} />
      </Card>

      <LoanRequestModal
        itemId={itemId}
        open={isModalVisible}
        onClose={(status: any) => {
          setIsModalVisible(false);
          setItemData((prev: any) => ({
            ...prev,
            item: {
              ...prev.item,
              status: status,
            },
          }));
        }}
      />
    </div>
  );
}

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
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Typography,
  Divider,
  Spin,
  Image,
} from "antd";
import dayjs from "dayjs";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { GetItemDetails } from "@/lib/handler/api/itemsHandler";
import { HistoryEntry } from "@/types/api";
import { HistoryRecords } from "@/types/itemTypes";
// import "@ant-design/v5-patch-for-react-19";
import LoanRequestModal from "@/components/LoanRequestModal";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [itemData, setItemData] = useState<any>(null);

  const itemId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) return;

      try {
        const res = await GetItemDetails(itemId);
        if (res.success) {
          setItemData(res.data);
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

    fetchItem();
  }, [itemId]);

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
      <div className="flex items-center gap-2">
        <Link href="/dashboard/items">
          <Button type="text" icon={<ArrowLeft size={16} />}>
            Back to Items
          </Button>
        </Link>
      </div>

      <Card variant="borderless">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {" "}
          <Image
            src={item.image}
            alt="item"
            className="flex !w-full md:!max-w-72 !aspect-square object-cover"
          />
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 flex-1">
            <div className="flex-1 ">
              <Title level={4}>{item.name}</Title>
              <div className="flex items-center gap-2 mb-2">
                {getStatusTag(item.status)}
              </div>
              <Text type="secondary">Serial Number: {item.code}</Text>
            </div>
            {user?.role === "siswa" && item.status === "tersedia" && (
              <Button type="primary" onClick={handleBorrowRequest}>
                Request to Borrow
              </Button>
            )}
          </div>
        </div>
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

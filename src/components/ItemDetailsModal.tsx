"use client";

import { useState } from "react";
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
} from "antd";
import { Clock } from "lucide-react";
import Link from "next/link";
import {
  getItemById,
  getUserById,
  getRequestsByItemId,
  getHistoryByItemId,
} from "@/dummy-data";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface ItemDetailModalProps {
  open: boolean;
  onClose: () => void;
  itemId: string;
}

export default function ItemDetailModal({
  open,
  onClose,
  itemId,
}: ItemDetailModalProps) {
  const { user } = useAuth();
  const [isBorrowModalVisible, setIsBorrowModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  if (!itemId) return null;

  const item = getItemById(itemId);
  const requests = getRequestsByItemId(itemId);
  const history = getHistoryByItemId(itemId);

  if (!item) {
    return (
      <Modal open={open} onCancel={onClose} footer={null}>
        <div className="text-center py-10">
          <Title level={4}>Item not found</Title>
        </div>
      </Modal>
    );
  }

  const addedByUser = getUserById(item.addedBy);

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
    setIsBorrowModalVisible(true);
  };

  const handleSubmitRequest = async (values: any) => {
    setLoading(true);
    setTimeout(() => {
      message.success("Borrow request submitted successfully");
      setIsBorrowModalVisible(false);
      setLoading(false);
      onClose(); // Close the main modal too if you want
    }, 1000);
  };

  return (
    <>
      <Modal
        title={item.name}
        open={open}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
            <div>
              <Title level={4}>{item.name}</Title>
              <div className="flex items-center gap-2 mb-2">
                <Tag>{item.category}</Tag>
                {getStatusTag(item.status)}
              </div>
              <Text type="secondary">Serial Number: {item.serialNumber}</Text>
            </div>
            {user?.role === "student" && item.status === "available" && (
              <Button type="primary" onClick={handleBorrowRequest}>
                Request to Borrow
              </Button>
            )}
          </div>

          <Divider />

          <Descriptions title="Equipment Details" layout="vertical" bordered>
            <Descriptions.Item label="Description" span={3}>
              {item.description}
            </Descriptions.Item>
            <Descriptions.Item label="Added By">
              {addedByUser?.name || "Unknown"}
            </Descriptions.Item>
            <Descriptions.Item label="Added Date">
              {item.addedDate}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(item.status)}
            </Descriptions.Item>
          </Descriptions>

          <Tabs defaultActiveKey="history" className="mt-6">
            <TabPane
              tab={
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  Borrowing History
                </span>
              }
              key="history"
            >
              <List
                dataSource={history}
                renderItem={(record) => {
                  const borrower =
                    user?.role === "student"
                      ? null
                      : getUserById(record.userId);

                  return (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <div className="flex items-center gap-2">
                            <span>
                              {borrower
                                ? `Borrowed by ${borrower.name}`
                                : "Borrowed"}
                            </span>
                          </div>
                        }
                        description={
                          <div>
                            <div>
                              Borrow Date: {record.borrowDate} | Return Date:{" "}
                              {record.returnDate}
                            </div>
                            {record.notes && (
                              <div className="mt-1">
                                <Text strong>Notes: </Text>
                                {record.notes}
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
                locale={{
                  emptyText: "No borrowing history for this item",
                }}
              />
            </TabPane>

            {(user?.role === "admin" || user?.role === "superadmin") && (
              <TabPane
                tab={
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    Current Requests
                  </span>
                }
                key="requests"
              >
                <List
                  dataSource={requests.filter(
                    (req) =>
                      req.status === "pending" || req.status === "approved"
                  )}
                  renderItem={(request) => {
                    const requester = getUserById(request.userId);
                    return (
                      <List.Item
                        actions={[
                          <Link
                            key="review"
                            href={`/dashboard/requests/${request.id}`}
                          >
                            <Button type="link">Review</Button>
                          </Link>,
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <div className="flex items-center gap-2">
                              <span>
                                Request by {requester?.name || "Unknown"}
                              </span>
                              <Tag
                                color={
                                  request.status === "pending"
                                    ? "orange"
                                    : "green"
                                }
                              >
                                {request.status}
                              </Tag>
                            </div>
                          }
                          description={
                            <div>
                              <div>Request Date: {request.requestDate}</div>
                              {request.dueDate && (
                                <div>Due Date: {request.dueDate}</div>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                  locale={{
                    emptyText: "No active requests for this item",
                  }}
                />
              </TabPane>
            )}
          </Tabs>
        </div>
      </Modal>

      {/* Nested Modal for Borrow Request */}
      <Modal
        title="Borrow Request"
        open={isBorrowModalVisible}
        onCancel={() => setIsBorrowModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitRequest}
          initialValues={{ purpose: "", returnDate: null }}
        >
          <Form.Item
            name="purpose"
            label="Purpose of Borrowing"
            rules={[
              {
                required: true,
                message: "Please explain why you need this equipment",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Explain why you need this equipment"
            />
          </Form.Item>

          <Form.Item
            name="returnDate"
            label="Expected Return Date"
            rules={[
              {
                required: true,
                message: "Please select an expected return date",
              },
            ]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-2">
            <Button onClick={() => setIsBorrowModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit Request
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

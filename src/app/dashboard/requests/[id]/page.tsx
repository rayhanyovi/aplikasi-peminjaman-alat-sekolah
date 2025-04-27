"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Typography,
  Divider,
  Space,
} from "antd";
import { ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";
import { requests, getItemById, getUserById } from "@/dummy-data";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function RequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [approveForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [returnForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const requestId = Array.isArray(id) ? id[0] : id;
  const request = requests.find((req) => req.id === requestId);

  if (!request) {
    return (
      <div className="text-center py-10">
        <Title level={4}>Request not found</Title>
        <Link href="/dashboard/requests">
          <Button type="primary">Back to Requests</Button>
        </Link>
      </div>
    );
  }

  // Check if user has permission to view this request
  if (user?.role === "student" && request.userId !== user.id) {
    router.push("/dashboard/requests");
    return null;
  }

  const item = getItemById(request.itemId);
  const requester = getUserById(request.userId);
  const approver = request.approvedBy ? getUserById(request.approvedBy) : null;

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

  const handleApprove = async (values: any) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      message.success("Request approved successfully");
      setApproveModalVisible(false);
      setLoading(false);
      router.push("/dashboard/requests");
    }, 1000);
  };

  const handleReject = async (values: any) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      message.success("Request rejected");
      setRejectModalVisible(false);
      setLoading(false);
      router.push("/dashboard/requests");
    }, 1000);
  };

  const handleReturn = async (values: any) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      message.success("Item marked as returned");
      setReturnModalVisible(false);
      setLoading(false);
      router.push("/dashboard/requests");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/requests">
          <Button type="text" icon={<ArrowLeft size={16} />}>
            Back to Requests
          </Button>
        </Link>
      </div>

      <Card variant="borderless">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div>
            <Title level={4}>Borrow Request</Title>
            <div className="flex items-center gap-2 mb-2">
              {getStatusTag(request.status)}
            </div>
            <Text type="secondary">Request ID: {request.id}</Text>
          </div>

          {(user?.role === "admin" || user?.role === "superadmin") &&
            request.status === "pending" && (
              <Space>
                <Button
                  type="primary"
                  icon={<Check size={16} />}
                  onClick={() => setApproveModalVisible(true)}
                >
                  Approve
                </Button>
                <Button
                  danger
                  icon={<X size={16} />}
                  onClick={() => setRejectModalVisible(true)}
                >
                  Reject
                </Button>
              </Space>
            )}

          {(user?.role === "admin" || user?.role === "superadmin") &&
            request.status === "approved" && (
              <Button
                type="primary"
                onClick={() => setReturnModalVisible(true)}
              >
                Mark as Returned
              </Button>
            )}
        </div>

        <Divider />

        <Descriptions title="Request Details" layout="vertical" bordered>
          <Descriptions.Item label="Equipment" span={2}>
            {item ? (
              <Link href={`/dashboard/items/${item.id}`}>{item.name}</Link>
            ) : (
              "Unknown Item"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {getStatusTag(request.status)}
          </Descriptions.Item>
          <Descriptions.Item label="Requested By" span={2}>
            {requester?.name || "Unknown User"}
          </Descriptions.Item>
          <Descriptions.Item label="Request Date">
            {request.requestDate}
          </Descriptions.Item>

          {request.approvedBy && (
            <>
              <Descriptions.Item label="Approved/Rejected By" span={2}>
                {approver?.name || "Unknown User"}
              </Descriptions.Item>
              <Descriptions.Item label="Processed Date">
                {request.approvedDate}
              </Descriptions.Item>
            </>
          )}

          {request.dueDate && (
            <Descriptions.Item label="Due Date" span={3}>
              {request.dueDate}
            </Descriptions.Item>
          )}

          {request.returnDate && (
            <>
              <Descriptions.Item label="Return Date" span={3}>
                {request.returnDate}
              </Descriptions.Item>
              {request.returnNotes && (
                <Descriptions.Item label="Return Notes" span={3}>
                  {request.returnNotes}
                </Descriptions.Item>
              )}
            </>
          )}
        </Descriptions>
      </Card>

      {/* Approve Modal */}
      <Modal
        title="Approve Request"
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        footer={null}
      >
        <Form form={approveForm} layout="vertical" onFinish={handleApprove}>
          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[
              {
                required: true,
                message: "Please select a due date",
              },
            ]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item name="notes" label="Notes (Optional)">
            <TextArea
              rows={4}
              placeholder="Add any notes about this approval"
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-2">
            <Button onClick={() => setApproveModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Approve
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Request"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
      >
        <Form form={rejectForm} layout="vertical" onFinish={handleReject}>
          <Form.Item
            name="reason"
            label="Reason for Rejection"
            rules={[
              {
                required: true,
                message: "Please provide a reason for rejection",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Explain why this request is being rejected"
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-2">
            <Button onClick={() => setRejectModalVisible(false)}>Cancel</Button>
            <Button danger htmlType="submit" loading={loading}>
              Reject
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Return Modal */}
      <Modal
        title="Mark as Returned"
        open={returnModalVisible}
        onCancel={() => setReturnModalVisible(false)}
        footer={null}
      >
        <Form form={returnForm} layout="vertical" onFinish={handleReturn}>
          <Form.Item
            name="returnNotes"
            label="Return Condition Notes"
            rules={[
              {
                required: true,
                message:
                  "Please provide notes about the condition of the returned item",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Describe the condition of the returned item (scratches, damage, etc.)"
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-2">
            <Button onClick={() => setReturnModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Confirm Return
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

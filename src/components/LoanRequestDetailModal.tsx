"use client";

import type React from "react";

import { useState } from "react";
import {
  Modal,
  Typography,
  Tag,
  Image,
  Button,
  Descriptions,
  Space,
  Badge,
} from "antd";
import dayjs from "dayjs";
import { useAuth } from "@/context/authContext";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  User,
  Mail,
  FileText,
  AlertCircle,
  CheckSquare,
} from "lucide-react";
import { getStatusTag } from "@/lib/helper/getStatusTag";

const { Title, Text } = Typography;

export default function LoanRequestDetailModal({ item, open, onClose }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const userRole = user?.role;

  const {
    student,
    items,
    status,
    requested_at,
    request_note,
    expected_return_at,
    approved_at,
    approved_by,
    rejected_at,
    rejected_by,
    rejection_notice,
    returned_at,
    return_note,
  } = item;

  const handleAction = (action: string) => {
    setLoading(true);
    // Simulate a delay for the loading state
    setTimeout(() => {
      setLoading(false);
      onClose(action);
    }, 500);
  };

  const isOverdue =
    expected_return_at &&
    status === "approved" &&
    dayjs().isAfter(dayjs(expected_return_at));

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span>Equipment Loan Details</span>
        </div>
      }
      open={open}
      onCancel={() => onClose()}
      footer={
        userRole === "admin" || userRole === "superadmin" ? (
          <div className="flex justify-end gap-3 mt-4">
            {status === "pending" ? (
              <>
                <Button
                  type="primary"
                  icon={<CheckSquare size={16} />}
                  onClick={() => handleAction("accept")}
                  loading={loading}
                >
                  Approve Request
                </Button>
                <Button
                  type="primary"
                  danger
                  ghost
                  icon={<XCircle size={16} />}
                  onClick={() => handleAction("reject")}
                  loading={loading}
                >
                  Reject Request
                </Button>
              </>
            ) : status === "approved" ? (
              <Button
                type="primary"
                icon={<RotateCcw size={16} />}
                onClick={() => handleAction("return")}
                loading={loading}
              >
                Process Return
              </Button>
            ) : null}
          </div>
        ) : null
      }
      width={800}
      centered
      className="loan-detail-modal"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Left Column - Image and Item Details */}
        <div className="md:col-span-1">
          <div className="flex flex-col items-center mb-4">
            <div className="w-full aspect-square overflow-hidden rounded-lg mb-3 bg-gray-50 flex items-center justify-center">
              <Image
                src={items?.image || "/placeholder.svg?height=200&width=200"}
                alt={items?.name}
                className="object-contain"
                style={{ maxHeight: "100%" }}
                fallback="/placeholder.svg?height=200&width=200"
              />
            </div>
            <div className="text-center w-full">
              <Title level={5} className="mb-1 line-clamp-2">
                {items?.name}
              </Title>
              <Text type="secondary" className="text-sm">
                Code: {items?.code}
              </Text>
            </div>
          </div>

          {isOverdue && (
            <div className="mt-4 bg-red-50 p-3 rounded-md border border-red-200">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <AlertCircle size={16} />
                <Text strong className="text-red-600">
                  Overdue
                </Text>
              </div>
              <Text className="text-red-600 text-sm">
                This item was due to be returned on{" "}
                {dayjs(expected_return_at).format("MMM D, YYYY")}
              </Text>
            </div>
          )}
        </div>

        {/* Right Column - Loan Details */}
        <div className="md:col-span-2">
          <Descriptions
            title="Borrower Information"
            column={1}
            bordered
            size="small"
            className="mb-4"
            labelStyle={{ fontWeight: 500, width: "140px" }}
          >
            <Descriptions.Item
              label={
                <Space>
                  <User size={14} />
                  <span>Name</span>
                </Space>
              }
            >
              {student?.name}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Space>
                  <Mail size={14} />
                  <span>Email</span>
                </Space>
              }
            >
              {student?.email}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Space>
                  <FileText size={14} />
                  <span>Purpose</span>
                </Space>
              }
            >
              {request_note || "-"}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Space>
                  <FileText size={14} />
                  <span>Status</span>
                </Space>
              }
            >
              {getStatusTag(status)}
            </Descriptions.Item>
          </Descriptions>

          <Descriptions
            title="Loan Timeline"
            column={1}
            bordered
            size="small"
            className="!mt-4"
            labelStyle={{ fontWeight: 500, width: "140px" }}
          >
            <Descriptions.Item
              label={
                <Space>
                  <Calendar size={14} />
                  <span>Requested</span>
                </Space>
              }
            >
              {dayjs(requested_at).format("MMM D, YYYY")}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Space>
                  <Calendar size={14} />
                  <span>Expected Return</span>
                </Space>
              }
            >
              {dayjs(expected_return_at).format("MMM D, YYYY")}
            </Descriptions.Item>

            {approved_at && (
              <Descriptions.Item
                label={
                  <Space>
                    <CheckCircle size={14} />
                    <span>Approved</span>
                  </Space>
                }
              >
                {dayjs(approved_at).format("MMM D, YYYY, HH:mm")}
                {approved_by && (
                  <div className="text-xs text-gray-500">
                    by {approved_by.name}
                  </div>
                )}
              </Descriptions.Item>
            )}

            {rejected_at && (
              <Descriptions.Item
                label={
                  <Space>
                    <XCircle size={14} />
                    <span>Rejected</span>
                  </Space>
                }
              >
                {dayjs(rejected_at).format("MMM D, YYYY, HH:mm")}
                {rejected_by && (
                  <div className="text-xs text-gray-500">by {rejected_by}</div>
                )}
              </Descriptions.Item>
            )}

            {returned_at && (
              <Descriptions.Item
                label={
                  <Space>
                    <RotateCcw size={14} />
                    <span>Returned</span>
                  </Space>
                }
              >
                {dayjs(returned_at).format("MMM D, YYYY, HH:mm")}
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* Additional Notes Section */}
          {(rejection_notice || return_note) && (
            <div className="mt-4">
              {rejection_notice && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200 mb-3">
                  <Text
                    strong
                    className="text-red-600 flex items-center gap-2 mb-1"
                  >
                    <AlertCircle size={14} />
                    Rejection Reason
                  </Text>
                  <Text className="text-red-700">{rejection_notice}</Text>
                </div>
              )}

              {return_note && (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                  <Text
                    strong
                    className="text-blue-600 flex items-center gap-2 mb-1"
                  >
                    <FileText size={14} />
                    Return Notes
                  </Text>
                  <Text className="text-blue-700">{return_note}</Text>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

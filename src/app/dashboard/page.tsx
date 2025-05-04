"use client";

import { useAuth } from "@/context/authContext";
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Tag,
  Button,
  Typography,
  message,
} from "antd";
import { Package, ClipboardList, Clock, Users } from "lucide-react";
import { items, requests } from "@/dummy-data";
import dayjs from "dayjs";
import Link from "next/link";
import { useDashboard } from "@/context/dashboardContext";
import { Suspense, useEffect, useState } from "react";
import DashboardLoading from "./loading";
import { getStatusTag } from "@/lib/helper/getStatusTag";
import { GetLoans } from "@/lib/handler/api/loansHandler";
import { RequestLoanItemType } from "@/types/requestTypes";
import { GetItems } from "@/lib/handler/api/itemsHandler";
import { Item } from "@/types/api";

const { Title } = Typography;

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<
    RequestLoanItemType[] | []
  >([]); // Correct type here
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const { user, isLoading: authContextLoading } = useAuth();
  const {
    totalUsers,
    totalItems,
    totalLoanedEquipment,
    totalRequest,
    refreshData,
    isLoading: dashboardContextLoading,
  } = useDashboard();

  useEffect(() => {
    setIsLoading(authContextLoading || dashboardContextLoading);
  }, [authContextLoading, dashboardContextLoading]);

  useEffect(() => {
    GetRequestPendingItems();
    GetAvailableItems();
  }, []);

  const GetRequestPendingItems = async () => {
    setIsLoading(true);
    await GetLoans(1, 5, { status: "pending" })
      .then((v) => setPendingRequests(v.data)) // Ensure the response is the correct type
      .catch((e) => message.error(e))
      .finally(() => setIsLoading(false)); // Fix to set loading state to false when done
  };

  const GetAvailableItems = async () => {
    setIsLoading(true);
    await GetItems("tersedia")
      .then((v) => setAvailableItems(v.data)) // Ensure the response is the correct type
      .catch((e) => message.error(e))
      .finally(() => setIsLoading(false)); // Fix to set loading state to false when done
  };
  const pendingItems = items.filter((item) => item.status === "pending");
  const borrowedItems = items.filter((item) => item.status === "borrowed");

  // Get student's requests if user is a student
  const studentRequests =
    user?.role === "student"
      ? requests.filter((req) => req.userId === user.id)
      : [];

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <Title level={4}>Dashboard</Title>
        <p className="text-gray-500">
          Welcome back, {user?.name}. Here's what's happening with your
          equipment.
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="w-full">
            <Statistic
              title="Available Equipment"
              value={totalItems ?? 0}
              prefix={<Package className="mr-2" size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="w-full">
            <Statistic
              title="Pending Requests"
              value={totalRequest ?? 0}
              prefix={<ClipboardList className="mr-2" size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="w-full">
            <Statistic
              title="Borrowed Equipment"
              value={totalLoanedEquipment ?? 0}
              prefix={<Clock className="mr-2" size={20} />}
            />
          </Card>
        </Col>
        {user?.role === "superadmin" && (
          <Col xs={24} sm={12} lg={6}>
            <Card variant="borderless" className="w-full">
              <Statistic
                title="Total Users"
                value={totalUsers ?? 0}
                prefix={<Users className="mr-2" size={20} />}
              />
            </Card>
          </Col>
        )}
      </Row>

      <Row gutter={[16, 16]}>
        {/* For Admin and Superadmin: Pending Requests */}
        {(user?.role === "admin" || user?.role === "superadmin") && (
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="flex items-center">
                  <ClipboardList className="mr-2" size={16} />
                  <span>Pending Requests</span>
                </div>
              }
              extra={
                <Link href="/dashboard/requests">
                  <Button type="link" size="small">
                    View All
                  </Button>
                </Link>
              }
              variant="borderless"
            >
              {pendingRequests.length > 0 ? (
                <List
                  dataSource={pendingRequests}
                  renderItem={(request: RequestLoanItemType) => {
                    return (
                      <List.Item
                        actions={[
                          <Link
                            key="view"
                            href={`/dashboard/requests/${request.id}`}
                          >
                            <Button type="link" size="small">
                              Review
                            </Button>
                          </Link>,
                        ]}
                      >
                        <List.Item.Meta
                          title={request.items.name || "Unknown Item"}
                          description={
                            <div>
                              <div>Requested by: {request.student.name}</div>
                              <div>Date: {request.requested_at}</div>
                            </div>
                          }
                        />
                        {getStatusTag(request.status)}
                      </List.Item>
                    );
                  }}
                  locale={{ emptyText: "No pending requests" }}
                />
              ) : (
                <p>Tidak ada Item</p> // Display the message when empty
              )}
            </Card>
          </Col>
        )}

        {/* For Students: My Requests */}
        {user?.role === "student" && (
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="flex items-center">
                  <ClipboardList className="mr-2" size={16} />
                  <span>My Requests</span>
                </div>
              }
              extra={
                <Link href="/dashboard/requests">
                  <Button type="link" size="small">
                    View All
                  </Button>
                </Link>
              }
              variant="borderless"
            >
              <List
                dataSource={studentRequests.slice(0, 5)}
                renderItem={(request) => {
                  const item = items.find((i) => i.id === request.itemId);
                  return (
                    <List.Item>
                      <List.Item.Meta
                        title={item?.name || "Unknown Item"}
                        description={
                          <div>
                            <div>Requested on: {request.requestDate}</div>
                            {request.dueDate && (
                              <div>Due date: {request.dueDate}</div>
                            )}
                          </div>
                        }
                      />
                      {getStatusTag(request.status)}
                    </List.Item>
                  );
                }}
                locale={{ emptyText: "No requests found" }}
              />
            </Card>
          </Col>
        )}

        {/* Available Equipment */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center">
                <Package className="mr-2" size={16} />
                <span>Available Equipment</span>
              </div>
            }
            extra={
              <Link href="/dashboard/items">
                <Button type="link" size="small">
                  View All
                </Button>
              </Link>
            }
            variant="borderless"
          >
            <List
              dataSource={availableItems.slice(0, 5)}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    user?.role === "student" ? (
                      <Link key="borrow" href={`/dashboard/items/${item.id}`}>
                        <Button type="link" size="small">
                          Borrow
                        </Button>
                      </Link>
                    ) : (
                      <Link key="view" href={`/dashboard/items/${item.id}`}>
                        <Button type="link" size="small">
                          View
                        </Button>
                      </Link>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={
                      <div>
                        <div>
                          Last Updated:{" "}
                          {dayjs(item.updated_at).format("dddd, DD MMMM YYYY")}
                        </div>
                        <div>Serial: {item.code}</div>
                      </div>
                    }
                  />
                  {getStatusTag(item.status)}
                </List.Item>
              )}
              locale={{ emptyText: "No available equipment" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

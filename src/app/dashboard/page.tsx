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
import {
  ApproveLoan,
  GetLoans,
  RejectLoan,
  ReturnLoan,
} from "@/lib/handler/api/loansHandler";
import { RequestLoanItemType } from "@/types/requestTypes";
import { GetItems } from "@/lib/handler/api/itemsHandler";
import { Item, LoanRequest } from "@/types/api";
import LoanRequestDetailModal from "@/components/LoanRequestDetailModal";
import LoanRejectModal from "@/components/LoanRejectModal";
import LoanReturnModal from "@/components/LoanReturnModal";

const { Title } = Typography;

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [isRequestDetailModalVisible, setIsRequestDetailModalVisible] =
    useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [borrowedItems, setBorrowedItems] = useState<any[]>([]);
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
    GetBorrowedItems();
  }, []);

  const GetRequestPendingItems = async () => {
    setIsLoading(true);
    await GetLoans(1, 5, { status: "pending" })
      .then((v) => setPendingRequests(v.data))
      .catch((e) => message.error(e))
      .finally(() => setIsLoading(false));
  };

  const GetAvailableItems = async () => {
    setIsLoading(true);
    await GetItems("tersedia")
      .then((v) => setAvailableItems(v.data))
      .catch((e) => message.error(e))
      .finally(() => setIsLoading(false));
  };

  const GetBorrowedItems = async () => {
    setIsLoading(true);
    await GetLoans(1, 5, { status: "approved" })
      .then((v) => setBorrowedItems(v.data))
      .catch((e) => message.error(e))
      .finally(() => setIsLoading(false));
  };

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const response = await ApproveLoan({
        itemId: selectedItem.item_id,
      });
      if (response.success) {
        message.success("Loan approved successfully");
        setIsLoading(false);
        pendingRequests.splice(pendingRequests.indexOf(selectedItem), 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (values: any) => {
    setIsLoading(true);
    try {
      const response = await RejectLoan({
        itemId: selectedItem.item_id,
        rejectionNote: values.payload,
      });
      if (response.success) {
        message.success("Loan rejected successfully");
        setIsRejectModalVisible(false);
        pendingRequests.splice(pendingRequests.indexOf(selectedItem), 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async (values: any) => {
    setIsLoading(true);
    try {
      const response = await ReturnLoan({
        itemId: selectedItem.item_id,
        returnNote: values.payload,
      });
      if (response.success) {
        message.success("Loan returned successfully");
        setIsRejectModalVisible(false);
        borrowedItems.splice(borrowedItems.indexOf(selectedItem), 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center">
                <ClipboardList className="mr-2" size={16} />
                <span onClick={() => console.log(pendingRequests)}>
                  {user?.role === "admin" || user?.role === "superadmin"
                    ? "Pending Requests"
                    : "My Requests"}
                </span>
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
            {pendingRequests && pendingRequests.length > 0 ? (
              pendingRequests.map((item, idx) => (
                <div
                  key={idx}
                  className={`items-stretch ${
                    idx === 0 ? "" : "border-t"
                  } border-gray-500/20 p-4 flex justify-between`}
                >
                  <div className="flex-1">
                    <p className="font-bold">{item.items.name}</p>
                    <div className="text-sm text-gray-600 mt-1">
                      <div>
                        Approved At:{" "}
                        {dayjs(item.appvoed_at).format("dddd, DD MMMM YYYY")}
                      </div>
                      <div>Serial: {item.items.code}</div>
                      <p>Borrowed by: {item.student.name}</p>

                      {getStatusTag(item.status, { className: "!mt-3" })}
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between ml-4">
                    <Button
                      type="link"
                      size="small"
                      className="mt-2"
                      onClick={() => {
                        setSelectedItem(item);
                        setIsRequestDetailModalVisible(true);
                      }}
                    >
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-48 flex flex-col items-center justify-center">
                <p>Tidak ada barang yang sedang dipinjam</p>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center">
                <Package className="mr-2" size={16} />
                <span>Borrowed Equipment</span>
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
            <div className="space-y-4">
              {borrowedItems.length > 0 ? (
                borrowedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`items-stretch ${
                      idx === 0 ? "" : "border-t"
                    } border-gray-500/20 p-4 flex justify-between`}
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{item.items.name}</p>
                      <div className="text-sm text-gray-400 mt-1">
                        <div>
                          Approved At:
                          {dayjs(item.appvoed_at).format("dddd, DD MMMM YYYY")}
                        </div>
                        <div>Serial: {item.items.code}</div>
                        <p>Borrowed by: {item.student.name}</p>
                        {getStatusTag(
                          item.status === "approved" ? "dipinjam" : "",
                          { className: "!mt-3" }
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end">
                      <Button
                        type="link"
                        size="small"
                        className="mt-2"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsRequestDetailModalVisible(true);
                        }}
                      >
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-48 flex flex-col items-center justify-center">
                  <p>Tidak ada barang yang sedang dipinjam</p>
                </div>
              )}
            </div>
          </Card>

          <LoanRequestDetailModal
            open={isRequestDetailModalVisible}
            onClose={(status: string) => {
              if (status === "reject") {
                setIsRejectModalVisible(true);
              } else if (status === "accept") {
                handleApprove();
              } else if (status === "return") {
                setIsReturnModalVisible(true);
              }

              setIsRequestDetailModalVisible(false);
            }}
            item={selectedItem}
          />

          <LoanRejectModal
            open={isRejectModalVisible}
            onClose={(payload?: any) => {
              setIsRejectModalVisible(false);
              if (payload) {
                handleReject(payload);
              }
            }}
            item={selectedItem}
          />

          <LoanReturnModal
            open={isRejectModalVisible}
            onClose={(payload?: any) => {
              setIsReturnModalVisible(false);
              if (payload) {
                handleReturn(payload);
              }
            }}
            item={selectedItem}
          />
        </Col>
        {/* )} */}
      </Row>
    </div>
  );
}

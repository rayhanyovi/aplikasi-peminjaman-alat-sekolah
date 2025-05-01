"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { message } from "antd";
import { GetStats } from "@/lib/handler/api/dashboardHandler"; // Make sure this API function exists

type DashboardContextType = {
  totalUsers: number | null;
  totalLoanedEquipment: number | null;
  totalRequest: number | null;
  totalItems: number | null;
  isLoading: boolean;
  refreshData: () => void; // Function to refresh data
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const [totalRequest, setTotalRequest] = useState<number | null>(null);
  const [totalLoanedEquipment, setTotalLoanedEquipment] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);

    try {
      const stats = await GetStats();
      setTotalUsers(stats.data.userCount);
      setTotalLoanedEquipment(stats.data.loanCount);
      setTotalRequest(stats.data.requestCount);
      setTotalItems(stats.data.itemsCount);
    } catch (error) {
      message.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refreshData = () => {
    fetchDashboardData();
  };

  return (
    <DashboardContext.Provider
      value={{
        totalUsers,
        totalItems,
        totalLoanedEquipment,
        totalRequest,
        isLoading,
        refreshData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

// Custom hook to use DashboardContext
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

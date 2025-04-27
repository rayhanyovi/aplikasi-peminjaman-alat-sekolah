"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/authContext";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Spin,
  theme,
  Drawer,
} from "antd";
import {
  Home,
  Package,
  ClipboardList,
  Users,
  Clock,
  LogOut,
  User,
  MenuIcon,
} from "lucide-react";
import Link from "next/link";

const { Header, Sider, Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const userMenu = [
    {
      key: "profile",
      label: (
        <div className="flex items-center gap-2">
          <User size={14} />
          <span>Profile</span>
        </div>
      ),
    },
    {
      key: "logout",
      label: (
        <div className="flex items-center gap-2 text-red-500">
          <LogOut size={14} />
          <span>Logout</span>
        </div>
      ),
      onClick: handleLogout,
    },
  ];

  // Define menu items based on user role
  const menuItems = [
    {
      key: "/dashboard",
      icon: <Home size={16} />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: "/dashboard/items",
      icon: <Package size={16} />,
      label: <Link href="/dashboard/items">Equipment</Link>,
    },
    {
      key: "/dashboard/requests",
      icon: <ClipboardList size={16} />,
      label: <Link href="/dashboard/requests">Requests</Link>,
    },
    {
      key: "/dashboard/history",
      icon: <Clock size={16} />,
      label: <Link href="/dashboard/history">History</Link>,
    },
  ];

  // Add Users menu item for Superadmin only
  if (user.role === "superadmin") {
    menuItems.splice(3, 0, {
      key: "/dashboard/users",
      icon: <Users size={16} />,
      label: <Link href="/dashboard/users">Users</Link>,
    });
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {isMobile ? (
        <Drawer
          title="Sistem Peminjaman Alat Sekolah"
          placement="left"
          closable={false}
          onClose={() => setIsMobileOpen(false)}
          open={isMobileOpen}
          width={200}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[pathname || "/dashboard"]}
            items={menuItems}
          />
        </Drawer>
      ) : (
        <Sider
          collapsible
          collapsed={isMobile ? false : collapsed}
          collapsedWidth={isMobile ? 0 : 80}
          trigger={null}
          breakpoint="md"
          width={200}
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: isMobile && !isMobileOpen ? "-100%" : 0, // move out of screen if mobile closed
            top: 0,
            bottom: 0,
            backgroundColor: token.colorBgContainer,
            borderRight: `1px solid ${token.colorBorderSecondary}`,
            transition: "left 0.3s", // smooth slide
            zIndex: 50, // make sure it's above content
          }}
        >
          <div className="p-4 h-16 flex items-center justify-center">
            <h1
              className={`text-xl font-bold ${collapsed ? "hidden" : "block"}`}
            >
              SPAS
            </h1>
            <p>Sistem Peminjaman Alat Sekolah</p>
            {collapsed && <Package size={24} />}
          </div>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[pathname || "/dashboard"]}
            items={menuItems}
          />
        </Sider>
      )}

      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 200,
          transition: "all 0.2s",
        }}
      >
        <Header
          style={{
            padding: "0 16px",
            background: token.colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
            position: "sticky",
            top: 0,
            zIndex: 1,
            width: "100%",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Button
            type="text"
            icon={<MenuIcon size={16} />}
            onClick={() => {
              if (isMobile) {
                setIsMobileOpen(!isMobileOpen);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="lg:hidden"
          />

          <div className="flex items-center">
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar
                  style={{
                    backgroundColor: token.colorPrimary,
                    color: token.colorWhite,
                  }}
                >
                  {user.name.charAt(0)}
                </Avatar>
                <div className="hidden md:block">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

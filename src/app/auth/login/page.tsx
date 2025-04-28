"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { Button, Form, Input, Card, Typography, message } from "antd";
import { LockIcon, MailIcon, UserRoundIcon } from "lucide-react";
import "@ant-design/v5-patch-for-react-19";

const { Title } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      // Pastikan login menangani error dengan lemparkan ke frontend
      await login(values.email, values.password).then(() => {
        message.success(`Logged in as ${values.email}`);
        router.push("/dashboard");
      });
    } catch (error: any) {
      console.error(error);
      message.error(error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = async (errorInfo: any) => {
    message.info("Login Failed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-md">
        <div className="text-center mb-6">
          <Title level={1} className="!mb-1 cursor-pointer">
            SPAS
          </Title>
          <p className="text-gray-500">Sistem Peminjaman Alat Sekolah </p>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed} // 👈 tambahin ini
          layout="vertical"
          size="large"
          autoComplete="off" // biar gak auto isi dari browser
        >
          <Form.Item
            label="email"
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input
              type="email"
              prefix={<MailIcon size={16} className="mr-2 text-gray-400" />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input
              type="password"
              prefix={<LockIcon size={16} className="mr-2 text-gray-400" />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              loading={loading}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

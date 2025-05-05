"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Divider,
  Avatar,
} from "antd";
import { UserCircle, Lock, Save } from "lucide-react";
import {
  UpdateUserPassword,
  UpdateUserProfile,
} from "@/lib/handler/api/userHandler";
import ImageUploader from "@/components/ImageUploader";
import { uploadImageHandler } from "@/lib/handler/api/imageHandler";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user, updateUserData } = useAuth();
  const [passwordForm] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarUrl(user.avatar_url);
    }
  }, [user]);

  const handlePasswordUpdate = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("New passwords don't match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await UpdateUserPassword(
        values.currentPassword,
        values.newPassword
      );

      if (response.success) {
        message.success("Password updated successfully");
        passwordForm.resetFields();
      } else {
        throw new Error(response.error || "Failed to update password");
      }
    } catch (error: any) {
      message.error(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureUpdate = async () => {
    if (!imageFile) {
      message.info("Please select an image to upload");
      return;
    }

    setIsLoading(true);
    try {
      if (user?.id === undefined) {
        throw new Error("User ID is required");
      }

      const uploadResponse = await uploadImageHandler(
        imageFile,
        "profile",
        user?.id
      );

      if (!uploadResponse.success) {
        throw new Error("Failed to upload image");
      }

      const response = await UpdateUserProfile({
        avatar_url: uploadResponse.url,
      });

      if (response.success) {
        message.success("Profile picture updated successfully");
        setAvatarUrl(uploadResponse.url);
        // Update the user context with the new avatar URL
        updateUserData({ avatar_url: uploadResponse.url });
      } else {
        throw new Error(response.error || "Failed to update profile");
      }
    } catch (error: any) {
      message.error(error.message || "Failed to update profile picture");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={4}>My Profile</Title>
        <p className="text-gray-500">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="borderless">
          <div className="flex flex-col items-center mb-6">
            <div className="mb-4">
              {avatarUrl ? (
                <Avatar src={avatarUrl} size={100} alt={user?.name || "User"} />
              ) : (
                <Avatar size={100} icon={<UserCircle size={60} />} />
              )}
            </div>
            <Title level={5}>{user?.name}</Title>
            <Text type="secondary">{user?.email}</Text>
            <Text className="capitalize mt-1">Role: {user?.role}</Text>
          </div>

          <Divider />

          <div className="space-y-4">
            <Title level={5}>Update Profile Picture</Title>
            <div className="flex flex-col items-center">
              <ImageUploader
                size={200}
                onSuccess={(file) => setImageFile(file)}
                existedFileList={
                  avatarUrl
                    ? [
                        {
                          uid: "1",
                          name: "avatar.jpg",
                          status: "done",
                          url: avatarUrl,
                        },
                      ]
                    : undefined
                }
              />
              <Button
                type="primary"
                icon={<Save size={16} />}
                onClick={handleProfilePictureUpdate}
                loading={isLoading}
                className="mt-4"
              >
                Save Profile Picture
              </Button>
            </div>
          </div>
        </Card>

        <Card variant="borderless">
          <Title level={5}>Change Password</Title>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordUpdate}
          >
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[
                {
                  required: true,
                  message: "Please enter your current password",
                },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                prefix={<Lock size={16} className="mr-2 text-gray-400" />}
                placeholder="Enter your current password"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: "Please enter your new password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                prefix={<Lock size={16} className="mr-2 text-gray-400" />}
                placeholder="Enter your new password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              rules={[
                { required: true, message: "Please confirm your new password" },
                { min: 6, message: "Password must be at least 6 characters" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<Lock size={16} className="mr-2 text-gray-400" />}
                placeholder="Confirm your new password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                icon={<Save size={16} />}
              >
                Update Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}

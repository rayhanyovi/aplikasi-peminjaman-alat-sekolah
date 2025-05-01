"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, message, Modal, DatePicker } from "antd";

import { RequestLoan } from "@/lib/handler/api/loansHandler";

const { TextArea } = Input;

export default function LoanRequestModal({ itemId, open, onClose }: any) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitLoanRequest = async (values: any) => {
    setIsLoading(true);

    try {
      const response = await RequestLoan({
        itemId: itemId,
        requestNote: values.requestNote,
        expectedReturn: values.expectedReturn,
      });
      if (response.success) {
        message.success("Loan request submitted successfully");
        onClose("pending");
        router.refresh();
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Borrow Request"
      open={open}
      onCancel={() => onClose()}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmitLoanRequest}
        initialValues={{ purpose: "", returnDate: null }}
      >
        <Form.Item
          name="requestNote"
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
          name="expectedReturn"
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
          <Button onClick={() => onClose()}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Submit Request
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

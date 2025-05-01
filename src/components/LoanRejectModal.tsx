import { useState } from "react";
import { Modal, Typography, Tag, Image, Row, Col, Divider, Button } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

export default function LoanRejectModal({ item, open, onClose }: any) {
  const [reason, setReason] = useState(""); // ⬅️ State untuk textarea

  if (!item) return null;

  return (
    <Modal
      title="Alasan Peminjaman Ditolak"
      open={open}
      onCancel={() => onClose()}
      footer={
        <>
          <Divider />
          <div className="flex flex-row gap-4 w-full items-end justify-end">
            <Button
              type="primary"
              danger
              ghost
              className="w-32"
              onClick={() => onClose({ payload: reason })}
            >
              Konfirmasi
            </Button>
          </div>
        </>
      }
      width={700}
    >
      <TextArea
        name="reason"
        placeholder="Alasan Peminjaman Ditolak"
        rows={4}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
    </Modal>
  );
}

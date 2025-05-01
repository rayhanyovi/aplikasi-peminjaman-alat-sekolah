import { useState } from "react";
import { Modal, Typography, Tag, Image, Row, Col, Divider, Button } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

export default function LoanReturnModal({ item, open, onClose }: any) {
  const [notes, setNotes] = useState("");

  if (!item) return null;

  return (
    <Modal
      title="Catatan Pengembalian"
      open={open}
      onCancel={() => onClose()}
      footer={
        <>
          <div className="flex flex-row gap-4 w-full items-end justify-end">
            <Button
              type="primary"
              className="w-32"
              onClick={() => {
                onClose({ payload: notes });
                setNotes("");
              }}
            >
              Konfirmasi
            </Button>
          </div>
        </>
      }
      width={700}
    >
      <TextArea
        className="!mt-8"
        name="notes"
        placeholder="Catatan Pengembalian (contoh: Lensa Tergores, Baut lepas, dsb)"
        rows={4}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <p className="italic text-gray-400 mt-4">
        Catatan: Kosongkan jika tidak ada catatan apa pun
      </p>
    </Modal>
  );
}

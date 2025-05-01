import { Modal, Typography, Tag, Image, Row, Col, Divider, Button } from "antd";
import dayjs from "dayjs";
import LoanRejectModal from "./LoanRejectModal";
import { useAuth } from "@/context/authContext";

const { Title, Text, Paragraph } = Typography;

export default function LoanRequestDetailModal({ item, open, onClose }: any) {
  const { user } = useAuth();
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

  const statusColorMap: any = {
    pending: "orange",
    approved: "green",
    rejected: "red",
    returned: "blue",
  };

  return (
    <>
      <Modal
        title="Detail Peminjaman"
        open={open}
        onCancel={() => onClose()}
        footer={
          userRole === "admin" || userRole === "superadmin" ? (
            <>
              <Divider />
              <div className="flex flex-row gap-4 w-full items-end justify-end">
                <Button
                  type="primary"
                  className="w-32"
                  onClick={() => onClose("accept")}
                >
                  Accept
                </Button>
                <Button
                  type="primary"
                  danger
                  ghost
                  className="w-32"
                  onClick={() => onClose("reject")}
                >
                  Tolak
                </Button>
              </div>
            </>
          ) : null
        }
        width={700}
      >
        <div className="flex flex-row gap-8">
          {/* Left Column - Image */}

          <div className="flex flex-col w-48">
            <Image
              src={items?.image}
              alt={items?.name}
              width="100%"
              style={{ borderRadius: 8 }}
            />
          </div>

          {/* Right Column - Details */}
          <Col xs={24} sm={16}>
            <Title level={4} style={{ marginBottom: 4 }}>
              {items?.name}
            </Title>
            <Text type="secondary">Kode Barang: {items?.code}</Text>
            <div style={{ marginTop: 8 }}>
              <Tag color={statusColorMap[status] || "default"}>
                {status?.toUpperCase()}
              </Tag>
            </div>

            <Divider style={{ margin: "12px 0" }} />

            <Text strong>Peminjam:</Text>
            <Paragraph style={{ marginBottom: 4 }}>
              {student?.name} ({student?.role})
            </Paragraph>
            <Text type="secondary">{student?.email}</Text>

            <Divider style={{ margin: "12px 0" }} />

            <Text strong>Tanggal Request:</Text>
            <Paragraph>{dayjs(requested_at).format("DD MMM YYYY")}</Paragraph>

            <Text strong>Estimasi Pengembalian:</Text>
            <Paragraph>
              {dayjs(expected_return_at).format("DD MMM YYYY")}
            </Paragraph>

            <Text strong>Tujuan Peminjaman:</Text>
            <Paragraph>{request_note || "-"}</Paragraph>
          </Col>
        </div>

        {/* Optional Details */}
        {(approved_at || rejected_at || returned_at) && (
          <>
            <Divider />

            {approved_at && (
              <>
                <Text strong>Disetujui pada:</Text>
                <Paragraph>
                  {dayjs(approved_at).format("DD MMM YYYY, HH:mm")}
                </Paragraph>
                <Text strong>Disetujui oleh:</Text>
                <Paragraph>{approved_by || "-"}</Paragraph>
              </>
            )}

            {rejected_at && (
              <>
                <Text strong>Ditolak pada:</Text>
                <Paragraph>
                  {dayjs(rejected_at).format("DD MMM YYYY, HH:mm")}
                </Paragraph>
                <Text strong>Ditolak oleh:</Text>
                <Paragraph>{rejected_by || "-"}</Paragraph>
                <Text strong>Alasan Penolakan:</Text>
                <Paragraph>{rejection_notice || "-"}</Paragraph>
              </>
            )}

            {returned_at && (
              <>
                <Text strong>Dikembalikan pada:</Text>
                <Paragraph>
                  {dayjs(returned_at).format("DD MMM YYYY, HH:mm")}
                </Paragraph>
                <Text strong>Catatan Pengembalian:</Text>
                <Paragraph>{return_note || "-"}</Paragraph>
              </>
            )}
          </>
        )}
      </Modal>
    </>
  );
}

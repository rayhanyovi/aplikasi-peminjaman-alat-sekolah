import { Tag } from "antd";

export const getStatusTag = (status: string, tagProps = {}) => {
  const statusMap: Record<string, { color: string; label: string }> = {
    tersedia: { color: "green", label: "Available" },
    pending: { color: "orange", label: "Pending" },
    dipinjam: { color: "blue", label: "Borrowed" },
    approved: { color: "green", label: "Approved" },
    rejected: { color: "red", label: "Rejected" },
    returned: { color: "cyan", label: "Returned" },
  };

  const current = statusMap[status];

  return (
    <Tag color={current?.color} {...tagProps}>
      {current?.label ?? status}
    </Tag>
  );
};

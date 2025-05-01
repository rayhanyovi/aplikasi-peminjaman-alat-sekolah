import { Tag } from "antd";

export const getStatusTag = (status: string) => {
  switch (status) {
    case "tersedia":
      return <Tag color="green">Available</Tag>;
    case "pending":
      return <Tag color="orange">Pending</Tag>;
    case "dipinjam":
      return <Tag color="blue">Borrowed</Tag>;
    case "approved":
      return <Tag color="green">Approved</Tag>;
    case "rejected":
      return <Tag color="red">Rejected</Tag>;
    case "returned":
      return <Tag color="cyan">Returned</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

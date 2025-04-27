import { Tag } from "antd";

export const getStatusTag = (status: string) => {
  switch (status) {
    case "available":
      return <Tag color="green">Available</Tag>;
    case "pending":
      return <Tag color="orange">Pending</Tag>;
    case "borrowed":
      return <Tag color="blue">Borrowed</Tag>;
    case "approved":
      return <Tag color="green">Approved</Tag>;
    case "rejected":
      return <Tag color="red">Rejected</Tag>;
    case "returned":
      return <Tag color="gray">Returned</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

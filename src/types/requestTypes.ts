interface Item {
  code: string;
  name: string;
  image: string;
}

export interface RequestLoanItemType {
  id: number;
  item_id: string;
  student_id: string;
  status: "rejected" | "approved" | "pending";
  requested_at: string; // ISO 8601 datetime string
  approved_at: string | null; // ISO 8601 datetime string or null
  approved_by: string | null;
  rejected_at: string; // ISO 8601 datetime string
  rejected_by: string; // User ID
  rejection_notice: string;
  returned_at: string | null; // ISO 8601 datetime string or null
  return_note: string | null;
  items: Item;
  student: {
    id: number;
    name: string;
    role: "siwa" | "admin" | "superadmin";
    email: string;
  };
}

export interface HistoryRecords {
  id: number;
  item_id: string;
  student_id: string;
  status: "pending" | "approved" | "rejected" | "borrowed" | "returned"; // status yang mungkin
  requested_at: string; // ISO date string
  approved_at: string | null;
  rejected_at: string | null;
  approved_by: string | null;
  rejected_by: string | null;
  rejection_notice: string | null;
  return_note: string | null;
  returned_at: string | null;
  borrower: UserProfile;
}

export interface Item {
  id: number;
  name: string;
  code: string;
  image: string;
  status: string;
  borrowed_by: UserProfile | null;
  history: HistoryRecords[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export type NewItem = Omit<Item, "id" | "borrowed_by" | "history">;

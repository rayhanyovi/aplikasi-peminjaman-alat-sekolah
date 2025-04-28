// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  next?: boolean;
  prev?: boolean;
  count?: number;
  error?: string;
  message?: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: "admin" | "superadmin" | "siswa";
  };
  session: {
    access_token: string;
    expires_at: number;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "superadmin" | "siswa";
  created_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: "admin" | "siswa";
  name?: string;
}

// Item Types
export interface Item {
  id: number;
  name: string;
  code: string;
  image: string;
  status: "tersedia" | "dipinjam" | "pending";
  borrowed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateItemRequest {
  name: string;
  code: string;
  image?: string;
}

export interface UpdateItemRequest {
  name?: string;
  code?: string;
  image?: string;
  status?: "tersedia" | "dipinjam" | "pending";
}

// Loan Types
export interface Loan {
  id: number;
  item_id: number;
  student_id: string;
  status: "pending" | "approved" | "rejected" | "returned";
  requested_at: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_notice?: string;
  returned_at?: string;
  return_note?: string;
}

export interface LoanRequest {
  itemId: number;
}

export interface LoanApproval {
  itemId: number;
}

export interface LoanRejection {
  itemId: number;
  rejectionNote: string;
}

export interface ItemReturn {
  itemId: number;
  returnNote: string;
}

// History Types
export interface HistoryEntry {
  id: number;
  item_id: number;
  student_id: string;
  borrower: string;
  approved_at: string;
  returned_at?: string;
  return_note?: string;
}

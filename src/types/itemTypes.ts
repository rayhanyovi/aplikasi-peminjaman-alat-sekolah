export interface HistoryEntry {
  borrower: string;
  borrowedDate: string;
  returnedDate: string | null;
  note: string;
  returnNote?: string;
}

export interface Item {
  id: number;
  name: string;
  code: string;
  image: string;
  note: string;
  status: string;
  borrowedBy: string | null;
  history: HistoryEntry[];
}

export type NewItem = Omit<Item, "id" | "borrowedBy" | "history">;

export interface HistoryEntry {
  borrower: string
  borrowedDate: string
  returnedDate: string | null
  note: string
  returnNote?: string
}

export interface Item {
  id: number
  name: string
  code: string
  image: string
  status: string
  borrowed_by: UserProfile | null
  history: HistoryEntry[]
}

export interface UserProfile {
  id: string
  name: string
  email: string
}

export type NewItem = Omit<Item, "id" | "borrowed_by" | "history">

import { supabase } from "../supabaseClient";

export async function RequestLoan({ itemId }: { itemId: number }) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const data = await fetch("/api/item/loan-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + session?.access_token,
    },
    body: JSON.stringify({ itemId: itemId }),
  });

  if (!data.ok) throw new Error("Gagal mendapatkan data item");
  return data.json();
}

export async function ApproveLoan({ itemId }: { itemId: number }) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const data = await fetch("/api/item/loan-approve", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + session?.access_token,
    },
    body: JSON.stringify({ itemId: itemId }),
  });

  if (!data.ok) throw new Error("Gagal mendapatkan data item");
  return data.json();
}

export async function RejectLoan({
  itemId,
  rejectionNote,
}: {
  itemId: number;
  rejectionNote: string;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const data = await fetch("/api/item/loan-reject", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + session?.access_token,
    },
    body: JSON.stringify({ itemId: itemId, rejectionNote: rejectionNote }),
  });

  if (!data.ok) throw new Error("Gagal mendapatkan data item");
  return data.json();
}

export async function ReturnLoan({
  itemId,
  returnNote,
}: {
  itemId: number;
  returnNote: string;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const data = await fetch("/api/item/return-item", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + session?.access_token,
    },
    body: JSON.stringify({ itemId: itemId, returnNote: returnNote }),
  });

  if (!data.ok) throw new Error("Gagal mendapatkan data item");
  return data.json();
}

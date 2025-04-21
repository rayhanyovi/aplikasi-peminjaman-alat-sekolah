// /lib/supabase/itemService.ts
import { supabase } from "@/lib/supabaseClient";
import { Item, NewItem } from "@/types/itemTypes";

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export async function fetchItems() {
  const token = await getAccessToken();

  const res = await fetch("/api/item/get-all-items", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Gagal mendapatkan data item");
  return res.json();
}

export async function addItem(item: NewItem) {
  const token = await getAccessToken();

  const res = await fetch("/api/item/add-item", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });

  if (!res.ok) throw new Error("Gagal menambahkan item");
  return res.json();
}

export async function updateItem(id: string | number, updates: NewItem) {
  const token = await getAccessToken();

  const res = await fetch(`/api/item/update-item?id=${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  console.log(res);

  if (!res.ok) throw new Error("Gagal mengupdate item");
  return res.json();
}

export async function deleteItem(id: string) {
  const token = await getAccessToken();

  const res = await fetch(`/api/item/delete-item?id=${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Gagal menghapus item");
}

export async function fetchHistory(itemId: number) {
  const token = await getAccessToken();

  const res = await fetch(`/api/item/history?itemId=${itemId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Gagal mendapatkan riwayat peminjaman");
  return res.json();
}

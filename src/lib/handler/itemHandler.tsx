// /lib/supabase/itemService.ts
import { supabase } from "@/lib/supabaseClient";
import { Item } from "@/types/itemTypes";
import { NewItem } from "@/types/itemTypes";

export async function fetchItems() {
  const { data, error } = await supabase.from("items").select("*");
  if (error) throw error;
  return data;
}

export async function addItem(item: NewItem) {
  const { data, error } = await supabase
    .from("items")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateItem(id: number, updates: NewItem) {
  const { data, error } = await supabase
    .from("items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteItem(id: Item) {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}

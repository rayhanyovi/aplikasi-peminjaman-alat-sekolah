export const GetItems = async (
  status?: string,
  page: number = 1,
  limit: number = 10
) => {
  const params = new URLSearchParams();

  if (status) {
    params.append("status", status);
  }
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const response = await fetch(`/api/items?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

export const GetItemDetails = async (id: string) => {
  const response = await fetch(`/api/items/${id}`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

export const AddNewItem = async (item: any) => {
  const response = await fetch(`/api/items/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
    credentials: "include",
  });
  return response.json();
};

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

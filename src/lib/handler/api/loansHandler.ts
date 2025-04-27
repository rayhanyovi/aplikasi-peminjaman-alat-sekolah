import getToken from "@/lib/helper/getToken";

export const GetLoans = async (
  status: string,
  page: number = 1,
  limit: number = 10
) => {
  const response = await fetch(
    `/api/loans?status=${status}&page=${page}&limit=${limit}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return response.json();
};

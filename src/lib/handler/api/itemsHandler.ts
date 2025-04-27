export const GetItems = async () =>
  //   status: string,
  //   page: number = 1,
  //   limit: number = 10
  {
    const response = await fetch(`/api/items`, {
      method: "GET",
      credentials: "include",
    });

    return response.json();
  };

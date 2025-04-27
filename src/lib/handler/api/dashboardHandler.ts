export const GetStats = async () => {
  const response = await fetch(`/api/dashboard/stats`, {
    method: "GET",
  });

  return response.json();
};

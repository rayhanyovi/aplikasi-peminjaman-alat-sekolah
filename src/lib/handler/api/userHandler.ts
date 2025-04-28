export const AddUser = async (email: string, role: string, name: string) => {
  const payload = {
    email,
    name,
    password: "password1234",
    role,
  };

  const response = await fetch("/api/users/add", {
    method: "POST",
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "Something went wrong");
    (error as any).status = response.status;
    throw error;
  }

  return data;
};

export const GetUsers = async (
  page: number = 1,
  limit: number = 10,
  filters: { name?: string; role?: string } = {}
) => {
  const params = new URLSearchParams();

  if (filters.name) {
    params.append("name", filters.name);
  }

  if (filters.role) {
    params.append("role", filters.role);
  }

  if (page) {
    params.append("page", page.toString());
  }

  params.append("limit", limit.toString());

  const response = await fetch(`/api/users?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "Something went wrong");
    (error as any).status = response.status;
    throw error;
  }

  return data;
};

export const GetAllUsers = async () => {
  const response = await fetch("/api/users", {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "Something went wrong");
    (error as any).status = response.status;
    throw error;
  }

  return data;
};

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

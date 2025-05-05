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

export const AddMultipleUser = async (users: any[]) => {
  const results = [];

  // Log the users being passed for processing

  // Loop through each user and send them one by one
  for (const user of users) {
    try {
      const payload = { ...user, password: "password1234" };

      const response = await fetch("/api/users/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Specify the content type
        },
        body: JSON.stringify(payload), // Send each user individually
        credentials: "include", // Include cookies if necessary
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Something went wrong");
        (error as any).status = response.status;
        throw error;
      }

      results.push(data);
    } catch (error: any) {
      console.error("Error importing user:", user, error); // Log any errors while importing users
    }
  }

  return results; // Return an array of responses or success data
};

export const GetUsers = async (
  page = 1,
  limit = 10,
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

export const GetUserProfile = async () => {
  const response = await fetch("/api/users/profile", {
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

export const UpdateUserProfile = async (profileData: {
  avatar_url: string;
}) => {
  const response = await fetch("/api/users/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
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

export const UpdateUserPassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const response = await fetch("/api/users/password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentPassword, newPassword }),
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

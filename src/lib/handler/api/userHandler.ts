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
  console.log("Users to be added:", users);

  // Loop through each user and send them one by one
  for (const user of users) {
    try {
      const payload = { ...user, password: "password1234" };
      console.log("Sending payload for user:", payload); // Log each user's payload before sending it

      const response = await fetch("/api/users/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Specify the content type
        },
        body: JSON.stringify(payload), // Send each user individually
        credentials: "include", // Include cookies if necessary
      });

      const data = await response.json();
      console.log("Response data:", data); // Log the response from the server

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

  console.log("Import results:", results); // Log the final results after all users are processed
  return results; // Return an array of responses or success data
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

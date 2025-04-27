export const UserSignIn = async (payload: any) => {
  const { email, password } = payload;

  const response = await fetch(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return response.json();
};

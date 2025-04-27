import { NextResponse } from "next/server";

export const createResponse = (
  success: boolean,
  data: any = null,
  message: string = "",
  status: number = 200
) => {
  return NextResponse.json({ success, data, message }, { status });
};

export const handleError = (error: any) => {
  const status = error.message.includes("Unauthorized") ? 403 : 500;
  return createResponse(
    false,
    null,
    error.message || "An error occurred",
    status
  );
};

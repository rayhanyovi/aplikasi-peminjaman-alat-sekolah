import getToken from "@/lib/helper/getToken";
import { LoanRequest } from "@/types/api";

export const GetLoans = async (
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

  const response = await fetch(`/api/loans?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  return response.json();
};

export const RequestLoan = async ({
  itemId,
  requestNote,
  expectedReturn,
}: LoanRequest) => {
  const payload = {
    itemId: itemId,
    requestNote: requestNote,
    expectedReturn: expectedReturn,
  };

  const response = await fetch(`/api/loans/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return response.json();
};

export const GetLoansHistory = async (
  status?: string,
  page: number = 1,
  limit: number = 10
) => {
  const params = new URLSearchParams();

  console.log("PARAMS ADALAH:", status, page, limit);

  if (status) {
    params.append("status", status);
  }
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const response = await fetch(`/api/history?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  return response.json();
};

export const RejectLoan = async ({
  itemId,
  rejectionNote,
}: {
  itemId: string;
  rejectionNote: string;
}) => {
  const payload = {
    itemId: itemId,
    rejectionNote: rejectionNote,
  };

  const response = await fetch(`/api/loans/reject`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return response.json();
};

export const ApproveLoan = async ({ itemId }: { itemId: string }) => {
  const payload = {
    itemId: itemId,
  };

  const response = await fetch(`/api/loans/approve`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return response.json();
};

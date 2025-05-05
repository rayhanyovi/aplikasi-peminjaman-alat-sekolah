import getToken from "@/lib/helper/getToken";
import { LoanRequest, LoanRequestFilter } from "@/types/api";

export const GetLoans = async (
  page: number = 1,
  limit: number = 10,
  filter: LoanRequestFilter = {}
) => {
  const params = new URLSearchParams();
  if (filter) {
    if (filter.status) {
      params.append("status", filter.status);
    }
    if (filter.name) {
      params.append("name", filter.name);
    }
    if (filter.startDate) {
      params.append("startDate", filter.startDate.toISOString());
    }
    if (filter.endDate) {
      params.append("endDate", filter.endDate.toISOString());
    }
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
  page: number = 1,
  limit: number = 10,
  filter: LoanRequestFilter = {}
) => {
  const params = new URLSearchParams();

  if (filter.status) {
    params.append("status", filter.status);
  }
  if (filter.name) {
    params.append("name", filter.name);
  }
  if (filter.startDate) {
    params.append("startDate", filter.startDate.toISOString());
  }
  if (filter.endDate) {
    params.append("endDate", filter.endDate.toISOString());
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

export const ReturnLoan = async ({
  itemId,
  returnNote,
}: {
  itemId: number;
  returnNote: string;
}) => {
  const payload = {
    itemId: itemId,
    returnNote: returnNote,
  };

  const response = await fetch(`/api/loans/return`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return response.json();
};

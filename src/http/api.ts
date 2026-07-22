import { TipoUser } from "../types";

export const apiGetUsers = async (
  backendUrl: string,
  token?: string | null,
  signal?: AbortSignal
) => {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${backendUrl.trim()}/users`, {
    signal,
    headers,
  });
};

export const apiGetUser = async (
  backendUrl: string,
  id: number,
  token?: string | null
) => {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${backendUrl.trim()}/users/${id}`, {
    headers,
  });
};

export const apiLogin = async (
  backendUrl: string,
  email: string,
  password: string
) => {
  return fetch(`${backendUrl.trim()}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.toLowerCase().trim(),
      password,
    }),
  });
};

export const apiRegister = async (
  backendUrl: string,
  registerData: {
    name: string;
    email: string;
    tipoUsuario: TipoUser;
    cpf: string;
    password?: string;
  }
) => {
  return fetch(`${backendUrl.trim()}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerData),
  });
};

export const apiCreateWallet = async (
  backendUrl: string,
  userId: number,
  token?: string | null
) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${backendUrl.trim()}/wallets/user/${userId}`, {
    method: "POST",
    headers,
  });
};

export const apiDeleteUser = async (
  backendUrl: string,
  userId: number,
  token?: string | null
) => {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${backendUrl.trim()}/users/${userId}`, {
    method: "DELETE",
    headers,
  });
};

export const apiUpdateUser = async (
  backendUrl: string,
  userId: number,
  userData: {
    name: string;
    email: string;
    type: TipoUser;
    cfp: string;
    password?: string;
  },
  token?: string | null
) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${backendUrl.trim()}/users/${userId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(userData),
  });
};

export const apiEarnCoins = async (
  backendUrl: string,
  walletId: number,
  amount: number,
  token?: string | null
) => {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${backendUrl.trim()}/wallets/${walletId}/earn?amount=${amount}`, {
    method: "POST",
    headers,
  });
};

export const apiSpendCoins = async (
  backendUrl: string,
  walletId: number,
  amount: number,
  token?: string | null
) => {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${backendUrl.trim()}/wallets/${walletId}/spend?amount=${amount}`, {
    method: "POST",
    headers,
  });
};

export const apiTransaction = async (
  backendUrl: string,
  walletId: number,
  endpoint: "earn" | "spend",
  amount: string,
  token?: string | null
) => {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${backendUrl.trim()}/wallets/${walletId}/${endpoint}?amount=${amount}`, {
    method: "POST",
    headers,
  });
};

export const apiGetWalletBalance = async (
  backendUrl: string,
  walletId: number,
  token?: string | null
) => {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${backendUrl.trim()}/wallets/${walletId}/balance`, {
    headers,
  });
};

export const apiGetWallet = async (
  backendUrl: string,
  walletId: number,
  token?: string | null
) => {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${backendUrl.trim()}/wallets/${walletId}`, {
    headers,
  });
};

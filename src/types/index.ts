export type TipoUser = "CUSTOMER" | "EMPLOYEE";
export type Screen = "LOGIN" | "CADASTRO" | "HOME";

export interface Wallet {
  id: number;
  amount: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  active: boolean;
  type: TipoUser;
  dateNasc: string; // ISO string
  cfp: string;
  wallet?: Wallet | null;
  createdAt?: string;
  updatedAt?: string;
}

// types/axios.ts
import { AxiosResponse } from "axios";

// Backend se expected error response
export interface IAxiosErrorResponse {
  error: string;      // backend error message
  success?: boolean;  // optional, kabhi kabhi backend success bhi return karta hai
}


// Generic Axios Error Type Guard
export function isAxiosError<T>(error: unknown): error is { response?: AxiosResponse<T> } {
  return typeof error === "object" && error !== null && "response" in error;
}
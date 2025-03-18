import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function CipMaker(cipCount: number) {
  const cipStart = 1000;

  return cipStart + cipCount;
}

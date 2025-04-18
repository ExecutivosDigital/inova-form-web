import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function CipMaker(cipCount: number) {
  const cipStart = 1000;

  return cipStart + cipCount;
}

export const sortByPosition = (
  a: { position: string },
  b: { position: string },
) => {
  const aParts = a.position.split(".").map(Number);
  const bParts = b.position.split(".").map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    if ((aParts[i] || 0) !== (bParts[i] || 0)) {
      return (aParts[i] || 0) - (bParts[i] || 0);
    }
  }
  return 0;
};

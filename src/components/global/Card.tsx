"use client";

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-3xl bg-white px-8 py-4 shadow-[0px_5px_10px_rgba(0,0,0,0.35)]">
      {children}
    </div>
  );
}

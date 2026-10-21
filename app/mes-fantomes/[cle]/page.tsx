import type { Metadata } from "next";
import { Suspense } from "react";
import MesFantomes from "./MesFantomes";

export const metadata: Metadata = {
  title: "Ma liste",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function PageMesFantomes() {
  return (
    <Suspense fallback={<main className="min-h-[70dvh]" />}>
      <MesFantomes />
    </Suspense>
  );
}
